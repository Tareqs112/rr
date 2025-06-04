const { Op } = require('sequelize');
const fs = require('fs');
const path = require('path');
const moment = require('moment');
const PDFDocument = require('pdfkit');
const { Parser } = require('json2csv');
const Booking = require('../models/Booking');
const Customer = require('../models/Customer');
const Vehicle = require('../models/Vehicle');
const VehicleModel = require('../models/VehicleModel');
const Driver = require('../models/Driver');

// Generate booking report
const generateBookingReport = async (filters = {}) => {
  try {
    const where = {};
    
    // Apply date filters
    if (filters.start_date && filters.end_date) {
      where.pickup_date = {
        [Op.between]: [filters.start_date, filters.end_date]
      };
    } else if (filters.start_date) {
      where.pickup_date = {
        [Op.gte]: filters.start_date
      };
    } else if (filters.end_date) {
      where.pickup_date = {
        [Op.lte]: filters.end_date
      };
    }
    
    // Apply status filter
    if (filters.status) {
      where.status = filters.status;
    }
    
    // Apply payment status filter
    if (filters.payment_status) {
      where.payment_status = filters.payment_status;
    }
    
    // Get bookings with related data
    const bookings = await Booking.findAll({
      where,
      include: [
        { model: Customer, attributes: ['id', 'full_name', 'phone', 'is_vip'] },
        { 
          model: Vehicle, 
          attributes: ['id', 'license_plate', 'color'],
          include: [
            { model: VehicleModel, attributes: ['id', 'name', 'manufacturer', 'daily_rate'] }
          ]
        },
        { model: Driver, attributes: ['id', 'name', 'phone'] }
      ],
      order: [['pickup_date', 'DESC']]
    });
    
    // Format booking data for report
    const formattedBookings = bookings.map(booking => {
      const bookingData = booking.toJSON();
      
      return {
        id: bookingData.id,
        booking_id: bookingData.booking_id,
        customer_name: bookingData.Customer ? bookingData.Customer.full_name : 'Unknown',
        customer_phone: bookingData.Customer ? bookingData.Customer.phone : 'Unknown',
        vehicle_plate: bookingData.Vehicle ? bookingData.Vehicle.license_plate : 'Unknown',
        vehicle_model: bookingData.Vehicle && bookingData.Vehicle.VehicleModel ? 
          bookingData.Vehicle.VehicleModel.name : 'Unknown',
        driver_name: bookingData.Driver ? bookingData.Driver.name : 'No Driver',
        pickup_date: bookingData.pickup_date,
        pickup_time: bookingData.pickup_time,
        return_date: bookingData.return_date,
        return_time: bookingData.return_time,
        status: bookingData.status,
        payment_status: bookingData.payment_status,
        payment_method: bookingData.payment_method || 'N/A',
        total_amount: bookingData.total_amount,
        created_at: bookingData.created_at
      };
    });
    
    return {
      success: true,
      bookings: formattedBookings,
      total: formattedBookings.length,
      total_amount: formattedBookings.reduce((sum, booking) => sum + parseFloat(booking.total_amount), 0)
    };
  } catch (error) {
    console.error('Error generating booking report:', error);
    return {
      success: false,
      message: 'Failed to generate booking report',
      error: error.message
    };
  }
};

// Generate vehicle report
const generateVehicleReport = async (filters = {}) => {
  try {
    // Get date range for calculations
    const startDate = filters.start_date ? moment(filters.start_date) : moment().subtract(30, 'days');
    const endDate = filters.end_date ? moment(filters.end_date) : moment();
    const totalDays = endDate.diff(startDate, 'days') + 1;
    
    // Get all vehicles with their models
    const vehicles = await Vehicle.findAll({
      include: [
        { model: VehicleModel, attributes: ['id', 'name', 'manufacturer', 'daily_rate'] }
      ]
    });
    
    // Get all bookings in the date range
    const bookings = await Booking.findAll({
      where: {
        [Op.or]: [
          {
            pickup_date: {
              [Op.between]: [startDate.format('YYYY-MM-DD'), endDate.format('YYYY-MM-DD')]
            }
          },
          {
            return_date: {
              [Op.between]: [startDate.format('YYYY-MM-DD'), endDate.format('YYYY-MM-DD')]
            }
          }
        ]
      }
    });
    
    // Calculate statistics for each vehicle
    const vehicleStats = vehicles.map(vehicle => {
      const vehicleData = vehicle.toJSON();
      
      // Find bookings for this vehicle
      const vehicleBookings = bookings.filter(booking => booking.vehicle_id === vehicle.id);
      
      // Calculate days booked
      let daysBooked = 0;
      vehicleBookings.forEach(booking => {
        const bookingStart = moment(booking.pickup_date);
        const bookingEnd = moment(booking.return_date);
        
        // Adjust dates to be within report range
        const effectiveStart = moment.max(bookingStart, startDate);
        const effectiveEnd = moment.min(bookingEnd, endDate);
        
        // Calculate days in range
        if (effectiveEnd.isAfter(effectiveStart) || effectiveEnd.isSame(effectiveStart)) {
          daysBooked += effectiveEnd.diff(effectiveStart, 'days') + 1;
        }
      });
      
      // Calculate availability rate
      const availabilityRate = Math.round(((totalDays - daysBooked) / totalDays) * 100);
      
      // Calculate total revenue
      const totalRevenue = vehicleBookings.reduce((sum, booking) => sum + parseFloat(booking.total_amount), 0);
      
      return {
        id: vehicleData.id,
        license_plate: vehicleData.license_plate,
        model_name: vehicleData.VehicleModel ? vehicleData.VehicleModel.name : 'Unknown',
        manufacturer: vehicleData.VehicleModel ? vehicleData.VehicleModel.manufacturer : 'Unknown',
        daily_rate: vehicleData.VehicleModel ? vehicleData.VehicleModel.daily_rate : 0,
        status: vehicleData.status,
        total_bookings: vehicleBookings.length,
        days_booked: daysBooked,
        availability_rate: availabilityRate,
        total_revenue: totalRevenue
      };
    });
    
    return {
      success: true,
      vehicles: vehicleStats,
      total: vehicleStats.length,
      date_range: {
        start_date: startDate.format('YYYY-MM-DD'),
        end_date: endDate.format('YYYY-MM-DD'),
        total_days: totalDays
      }
    };
  } catch (error) {
    console.error('Error generating vehicle report:', error);
    return {
      success: false,
      message: 'Failed to generate vehicle report',
      error: error.message
    };
  }
};

// Generate customer report
const generateCustomerReport = async (filters = {}) => {
  try {
    // Get date range for calculations
    const startDate = filters.start_date ? moment(filters.start_date) : moment().subtract(30, 'days');
    const endDate = filters.end_date ? moment(filters.end_date) : moment();
    
    // Get all customers
    const customers = await Customer.findAll();
    
    // Get all bookings in the date range
    const bookings = await Booking.findAll({
      where: {
        pickup_date: {
          [Op.between]: [startDate.format('YYYY-MM-DD'), endDate.format('YYYY-MM-DD')]
        }
      }
    });
    
    // Calculate statistics for each customer
    const customerStats = customers.map(customer => {
      const customerData = customer.toJSON();
      
      // Find bookings for this customer
      const customerBookings = bookings.filter(booking => booking.customer_id === customer.id);
      
      // Calculate total spent
      const totalSpent = customerBookings.reduce((sum, booking) => sum + parseFloat(booking.total_amount), 0);
      
      // Find last booking date
      let lastBooking = null;
      if (customerBookings.length > 0) {
        const bookingDates = customerBookings.map(booking => moment(booking.pickup_date));
        lastBooking = moment.max(bookingDates).format('YYYY-MM-DD');
      }
      
      return {
        id: customerData.id,
        full_name: customerData.full_name,
        phone: customerData.phone,
        whatsapp: customerData.whatsapp || 'N/A',
        company_name: customerData.company_name || 'N/A',
        is_vip: customerData.is_vip,
        is_repeat_customer: customerData.is_repeat_customer,
        total_bookings: customerBookings.length,
        last_booking: lastBooking,
        total_spent: totalSpent
      };
    });
    
    return {
      success: true,
      customers: customerStats,
      total: customerStats.length,
      date_range: {
        start_date: startDate.format('YYYY-MM-DD'),
        end_date: endDate.format('YYYY-MM-DD')
      }
    };
  } catch (error) {
    console.error('Error generating customer report:', error);
    return {
      success: false,
      message: 'Failed to generate customer report',
      error: error.message
    };
  }
};

// Generate dashboard summary
const generateDashboardSummary = async () => {
  try {
    // Get date ranges
    const today = moment().format('YYYY-MM-DD');
    const thirtyDaysAgo = moment().subtract(30, 'days').format('YYYY-MM-DD');
    const startOfYear = moment().startOf('year').format('YYYY-MM-DD');
    
    // Get all bookings
    const bookings = await Booking.findAll({
      include: [
        { model: Customer },
        { 
          model: Vehicle,
          include: [{ model: VehicleModel }]
        }
      ]
    });
    
    // Calculate total bookings and revenue
    const totalBookings = bookings.length;
    const totalRevenue = bookings.reduce((sum, booking) => sum + parseFloat(booking.total_amount), 0);
    const averageBookingValue = totalBookings > 0 ? totalRevenue / totalBookings : 0;
    
    // Get bookings by status
    const bookingsByStatus = [];
    const statusCounts = {};
    
    bookings.forEach(booking => {
      if (!statusCounts[booking.payment_status]) {
        statusCounts[booking.payment_status] = 0;
      }
      statusCounts[booking.payment_status]++;
    });
    
    Object.keys(statusCounts).forEach(status => {
      bookingsByStatus.push({
        status,
        count: statusCounts[status]
      });
    });
    
    // Get bookings by month
    const bookingsByMonth = [];
    const monthCounts = {};
    
    bookings.forEach(booking => {
      const month = moment(booking.pickup_date).format('MMM YYYY');
      if (!monthCounts[month]) {
        monthCounts[month] = 0;
      }
      monthCounts[month]++;
    });
    
    Object.keys(monthCounts).sort((a, b) => {
      return moment(a, 'MMM YYYY').diff(moment(b, 'MMM YYYY'));
    }).forEach(month => {
      bookingsByMonth.push({
        month,
        count: monthCounts[month]
      });
    });
    
    // Get top vehicles
    const vehicleStats = {};
    
    bookings.forEach(booking => {
      if (booking.Vehicle) {
        const vehicleId = booking.Vehicle.id;
        if (!vehicleStats[vehicleId]) {
          vehicleStats[vehicleId] = {
            license_plate: booking.Vehicle.license_plate,
            model_name: booking.Vehicle.VehicleModel ? booking.Vehicle.VehicleModel.name : 'Unknown',
            bookings: 0,
            revenue: 0
          };
        }
        
        vehicleStats[vehicleId].bookings++;
        vehicleStats[vehicleId].revenue += parseFloat(booking.total_amount);
      }
    });
    
    const topVehicles = Object.values(vehicleStats)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
    
    // Get top customers
    const customerStats = {};
    
    bookings.forEach(booking => {
      if (booking.Customer) {
        const customerId = booking.Customer.id;
        if (!customerStats[customerId]) {
          customerStats[customerId] = {
            full_name: booking.Customer.full_name,
            is_vip: booking.Customer.is_vip,
            bookings: 0,
            spent: 0
          };
        }
        
        customerStats[customerId].bookings++;
        customerStats[customerId].spent += parseFloat(booking.total_amount);
      }
    });
    
    const topCustomers = Object.values(customerStats)
      .sort((a, b) => b.spent - a.spent)
      .slice(0, 5);
    
    return {
      success: true,
      summary: {
        total_bookings: totalBookings,
        total_revenue: totalRevenue.toFixed(2),
        average_booking_value: averageBookingValue.toFixed(2),
        bookings_by_status: bookingsByStatus,
        bookings_by_month: bookingsByMonth,
        top_vehicles: topVehicles,
        top_customers: topCustomers
      }
    };
  } catch (error) {
    console.error('Error generating dashboard summary:', error);
    return {
      success: false,
      message: 'Failed to generate dashboard summary',
      error: error.message
    };
  }
};

// Export report to PDF
const exportReportToPDF = async (reportType, data) => {
  try {
    // Create a new PDF document
    const doc = new PDFDocument({ margin: 50 });
    
    // Set up the document
    doc.font('Helvetica-Bold')
       .fontSize(20)
       .text(`Car Rental System - ${reportType.toUpperCase()} Report`, { align: 'center' })
       .moveDown();
    
    // Add date range if available
    if (data.date_range) {
      doc.font('Helvetica')
         .fontSize(12)
         .text(`Period: ${data.date_range.start_date} to ${data.date_range.end_date}`, { align: 'center' })
         .moveDown();
    }
    
    // Add report content based on type
    switch (reportType) {
      case 'bookings':
        addBookingsReportContent(doc, data);
        break;
      case 'vehicles':
        addVehiclesReportContent(doc, data);
        break;
      case 'customers':
        addCustomersReportContent(doc, data);
        break;
      case 'summary':
        addSummaryReportContent(doc, data.summary);
        break;
      default:
        doc.text('Invalid report type', { align: 'center' });
        break;
    }
    
    // Add footer with date
    const pageCount = doc.bufferedPageRange().count;
    for (let i = 0; i < pageCount; i++) {
      doc.switchToPage(i);
      
      // Add page number
      doc.fontSize(10)
         .text(
           `Page ${i + 1} of ${pageCount}`,
           50,
           doc.page.height - 50,
           { align: 'center' }
         );
    }
    
    // Finalize the PDF
    doc.end();
    
    return doc;
  } catch (error) {
    console.error('Error exporting report to PDF:', error);
    throw error;
  }
};

// Add bookings report content to PDF
const addBookingsReportContent = (doc, data) => {
  // Add summary
  doc.font('Helvetica-Bold')
     .fontSize(14)
     .text('Summary', { underline: true })
     .moveDown(0.5);
  
  doc.font('Helvetica')
     .fontSize(12)
     .text(`Total Bookings: ${data.total}`)
     .text(`Total Revenue: $${data.total_amount.toFixed(2)}`)
     .moveDown();
  
  // Add bookings table
  doc.font('Helvetica-Bold')
     .fontSize(14)
     .text('Booking Details', { underline: true })
     .moveDown(0.5);
  
  // Table headers
  const tableTop = doc.y;
  const tableHeaders = ['Booking ID', 'Customer', 'Vehicle', 'Pickup Date', 'Status', 'Amount'];
  const columnWidths = [80, 100, 100, 80, 70, 70];
  
  let currentY = tableTop;
  
  // Draw headers
  doc.font('Helvetica-Bold').fontSize(10);
  tableHeaders.forEach((header, i) => {
    let xPos = 50;
    for (let j = 0; j < i; j++) {
      xPos += columnWidths[j];
    }
    doc.text(header, xPos, currentY);
  });
  
  currentY += 20;
  
  // Draw rows
  doc.font('Helvetica').fontSize(10);
  data.bookings.forEach((booking, index) => {
    // Check if we need a new page
    if (currentY > doc.page.height - 100) {
      doc.addPage();
      currentY = 50;
      
      // Redraw headers on new page
      doc.font('Helvetica-Bold').fontSize(10);
      tableHeaders.forEach((header, i) => {
        let xPos = 50;
        for (let j = 0; j < i; j++) {
          xPos += columnWidths[j];
        }
        doc.text(header, xPos, currentY);
      });
      
      currentY += 20;
      doc.font('Helvetica').fontSize(10);
    }
    
    // Draw row
    doc.text(booking.booking_id, 50, currentY);
    doc.text(booking.customer_name, 130, currentY);
    doc.text(booking.vehicle_plate, 230, currentY);
    doc.text(moment(booking.pickup_date).format('MM/DD/YYYY'), 330, currentY);
    doc.text(booking.payment_status, 410, currentY);
    doc.text(`$${booking.total_amount}`, 480, currentY);
    
    currentY += 15;
    
    // Add a light gray line after each row except the last
    if (index < data.bookings.length - 1) {
      doc.strokeColor('#CCCCCC')
         .lineWidth(0.5)
         .moveTo(50, currentY - 5)
         .lineTo(550, currentY - 5)
         .stroke();
    }
  });
};

// Add vehicles report content to PDF
const addVehiclesReportContent = (doc, data) => {
  // Add summary
  doc.font('Helvetica-Bold')
     .fontSize(14)
     .text('Summary', { underline: true })
     .moveDown(0.5);
  
  doc.font('Helvetica')
     .fontSize(12)
     .text(`Total Vehicles: ${data.total}`)
     .text(`Date Range: ${data.date_range.start_date} to ${data.date_range.end_date} (${data.date_range.total_days} days)`)
     .moveDown();
  
  // Add vehicles table
  doc.font('Helvetica-Bold')
     .fontSize(14)
     .text('Vehicle Performance', { underline: true })
     .moveDown(0.5);
  
  // Table headers
  const tableTop = doc.y;
  const tableHeaders = ['License Plate', 'Model', 'Bookings', 'Days Booked', 'Availability', 'Revenue'];
  const columnWidths = [80, 100, 70, 80, 80, 70];
  
  let currentY = tableTop;
  
  // Draw headers
  doc.font('Helvetica-Bold').fontSize(10);
  tableHeaders.forEach((header, i) => {
    let xPos = 50;
    for (let j = 0; j < i; j++) {
      xPos += columnWidths[j];
    }
    doc.text(header, xPos, currentY);
  });
  
  currentY += 20;
  
  // Draw rows
  doc.font('Helvetica').fontSize(10);
  data.vehicles.forEach((vehicle, index) => {
    // Check if we need a new page
    if (currentY > doc.page.height - 100) {
      doc.addPage();
      currentY = 50;
      
      // Redraw headers on new page
      doc.font('Helvetica-Bold').fontSize(10);
      tableHeaders.forEach((header, i) => {
        let xPos = 50;
        for (let j = 0; j < i; j++) {
          xPos += columnWidths[j];
        }
        doc.text(header, xPos, currentY);
      });
      
      currentY += 20;
      doc.font('Helvetica').fontSize(10);
    }
    
    // Draw row
    doc.text(vehicle.license_plate, 50, currentY);
    doc.text(vehicle.model_name, 130, currentY);
    doc.text(vehicle.total_bookings.toString(), 230, currentY);
    doc.text(vehicle.days_booked.toString(), 300, currentY);
    doc.text(`${vehicle.availability_rate}%`, 380, currentY);
    doc.text(`$${vehicle.total_revenue.toFixed(2)}`, 460, currentY);
    
    currentY += 15;
    
    // Add a light gray line after each row except the last
    if (index < data.vehicles.length - 1) {
      doc.strokeColor('#CCCCCC')
         .lineWidth(0.5)
         .moveTo(50, currentY - 5)
         .lineTo(550, currentY - 5)
         .stroke();
    }
  });
};

// Add customers report content to PDF
const addCustomersReportContent = (doc, data) => {
  // Add summary
  doc.font('Helvetica-Bold')
     .fontSize(14)
     .text('Summary', { underline: true })
     .moveDown(0.5);
  
  doc.font('Helvetica')
     .fontSize(12)
     .text(`Total Customers: ${data.total}`)
     .text(`VIP Customers: ${data.customers.filter(c => c.is_vip).length}`)
     .text(`Date Range: ${data.date_range.start_date} to ${data.date_range.end_date}`)
     .moveDown();
  
  // Add customers table
  doc.font('Helvetica-Bold')
     .fontSize(14)
     .text('Customer Details', { underline: true })
     .moveDown(0.5);
  
  // Table headers
  const tableTop = doc.y;
  const tableHeaders = ['Customer Name', 'Phone', 'VIP', 'Bookings', 'Last Booking', 'Total Spent'];
  const columnWidths = [120, 100, 40, 70, 90, 80];
  
  let currentY = tableTop;
  
  // Draw headers
  doc.font('Helvetica-Bold').fontSize(10);
  tableHeaders.forEach((header, i) => {
    let xPos = 50;
    for (let j = 0; j < i; j++) {
      xPos += columnWidths[j];
    }
    doc.text(header, xPos, currentY);
  });
  
  currentY += 20;
  
  // Draw rows
  doc.font('Helvetica').fontSize(10);
  data.customers.forEach((customer, index) => {
    // Check if we need a new page
    if (currentY > doc.page.height - 100) {
      doc.addPage();
      currentY = 50;
      
      // Redraw headers on new page
      doc.font('Helvetica-Bold').fontSize(10);
      tableHeaders.forEach((header, i) => {
        let xPos = 50;
        for (let j = 0; j < i; j++) {
          xPos += columnWidths[j];
        }
        doc.text(header, xPos, currentY);
      });
      
      currentY += 20;
      doc.font('Helvetica').fontSize(10);
    }
    
    // Draw row
    doc.text(customer.full_name, 50, currentY);
    doc.text(customer.phone, 170, currentY);
    doc.text(customer.is_vip ? 'Yes' : 'No', 270, currentY);
    doc.text(customer.total_bookings.toString(), 310, currentY);
    doc.text(customer.last_booking || 'N/A', 380, currentY);
    doc.text(`$${customer.total_spent.toFixed(2)}`, 470, currentY);
    
    currentY += 15;
    
    // Add a light gray line after each row except the last
    if (index < data.customers.length - 1) {
      doc.strokeColor('#CCCCCC')
         .lineWidth(0.5)
         .moveTo(50, currentY - 5)
         .lineTo(550, currentY - 5)
         .stroke();
    }
  });
};

// Add summary report content to PDF
const addSummaryReportContent = (doc, summary) => {
  // Add key metrics
  doc.font('Helvetica-Bold')
     .fontSize(14)
     .text('Key Metrics', { underline: true })
     .moveDown(0.5);
  
  doc.font('Helvetica')
     .fontSize(12)
     .text(`Total Bookings: ${summary.total_bookings}`)
     .text(`Total Revenue: $${summary.total_revenue}`)
     .text(`Average Booking Value: $${summary.average_booking_value}`)
     .moveDown();
  
  // Add bookings by status
  doc.font('Helvetica-Bold')
     .fontSize(14)
     .text('Bookings by Status', { underline: true })
     .moveDown(0.5);
  
  doc.font('Helvetica').fontSize(12);
  summary.bookings_by_status.forEach(item => {
    doc.text(`${item.status.toUpperCase()}: ${item.count} bookings`);
  });
  doc.moveDown();
  
  // Add bookings by month
  doc.font('Helvetica-Bold')
     .fontSize(14)
     .text('Bookings by Month', { underline: true })
     .moveDown(0.5);
  
  doc.font('Helvetica').fontSize(12);
  summary.bookings_by_month.forEach(item => {
    doc.text(`${item.month}: ${item.count} bookings`);
  });
  doc.moveDown();
  
  // Add top vehicles
  doc.font('Helvetica-Bold')
     .fontSize(14)
     .text('Top Performing Vehicles', { underline: true })
     .moveDown(0.5);
  
  // Table headers
  let tableTop = doc.y;
  let tableHeaders = ['License Plate', 'Model', 'Bookings', 'Revenue'];
  let columnWidths = [100, 150, 70, 100];
  
  let currentY = tableTop;
  
  // Draw headers
  doc.font('Helvetica-Bold').fontSize(10);
  tableHeaders.forEach((header, i) => {
    let xPos = 50;
    for (let j = 0; j < i; j++) {
      xPos += columnWidths[j];
    }
    doc.text(header, xPos, currentY);
  });
  
  currentY += 20;
  
  // Draw rows
  doc.font('Helvetica').fontSize(10);
  summary.top_vehicles.forEach((vehicle, index) => {
    // Check if we need a new page
    if (currentY > doc.page.height - 150) {
      doc.addPage();
      currentY = 50;
    }
    
    // Draw row
    doc.text(vehicle.license_plate, 50, currentY);
    doc.text(vehicle.model_name, 150, currentY);
    doc.text(vehicle.bookings.toString(), 300, currentY);
    doc.text(`$${vehicle.revenue.toFixed(2)}`, 370, currentY);
    
    currentY += 15;
  });
  
  // Add top customers
  // Check if we need a new page
  if (currentY > doc.page.height - 200) {
    doc.addPage();
    currentY = 50;
  } else {
    currentY += 20;
  }
  
  doc.font('Helvetica-Bold')
     .fontSize(14)
     .text('Top Customers', { underline: true }, 50, currentY)
     .moveDown(0.5);
  
  currentY = doc.y;
  
  // Table headers
  tableHeaders = ['Customer Name', 'VIP', 'Bookings', 'Total Spent'];
  columnWidths = [150, 70, 70, 100];
  
  // Draw headers
  doc.font('Helvetica-Bold').fontSize(10);
  tableHeaders.forEach((header, i) => {
    let xPos = 50;
    for (let j = 0; j < i; j++) {
      xPos += columnWidths[j];
    }
    doc.text(header, xPos, currentY);
  });
  
  currentY += 20;
  
  // Draw rows
  doc.font('Helvetica').fontSize(10);
  summary.top_customers.forEach((customer, index) => {
    // Draw row
    doc.text(customer.full_name, 50, currentY);
    doc.text(customer.is_vip ? 'Yes' : 'No', 200, currentY);
    doc.text(customer.bookings.toString(), 270, currentY);
    doc.text(`$${customer.spent.toFixed(2)}`, 340, currentY);
    
    currentY += 15;
  });
};

// Export report to CSV
const exportReportToCSV = async (reportType, data) => {
  try {
    let fields = [];
    let csvData = [];
    
    // Prepare data based on report type
    switch (reportType) {
      case 'bookings':
        fields = [
          'booking_id',
          'customer_name',
          'vehicle_plate',
          'pickup_date',
          'pickup_time',
          'return_date',
          'return_time',
          'status',
          'payment_status',
          'total_amount'
        ];
        csvData = data.bookings;
        break;
      case 'vehicles':
        fields = [
          'license_plate',
          'model_name',
          'manufacturer',
          'status',
          'total_bookings',
          'days_booked',
          'availability_rate',
          'total_revenue'
        ];
        csvData = data.vehicles;
        break;
      case 'customers':
        fields = [
          'full_name',
          'phone',
          'is_vip',
          'is_repeat_customer',
          'total_bookings',
          'last_booking',
          'total_spent'
        ];
        csvData = data.customers;
        break;
      default:
        throw new Error('Invalid report type for CSV export');
    }
    
    // Create parser
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(csvData);
    
    return csv;
  } catch (error) {
    console.error('Error exporting report to CSV:', error);
    throw error;
  }
};

// Export report (PDF or CSV)
const exportReport = async (reportType, params) => {
  try {
    // Get report data
    let reportData;
    
    switch (reportType) {
      case 'bookings':
        reportData = await generateBookingReport(params);
        break;
      case 'vehicles':
        reportData = await generateVehicleReport(params);
        break;
      case 'customers':
        reportData = await generateCustomerReport(params);
        break;
      case 'summary':
        reportData = await generateDashboardSummary();
        break;
      default:
        throw new Error('Invalid report type');
    }
    
    if (!reportData.success) {
      throw new Error(reportData.message || 'Failed to generate report data');
    }
    
    // Export based on format
    if (params.format === 'pdf') {
      return await exportReportToPDF(reportType, reportData);
    } else if (params.format === 'csv') {
      return await exportReportToCSV(reportType, reportData);
    } else {
      throw new Error('Invalid export format');
    }
  } catch (error) {
    console.error('Error exporting report:', error);
    throw error;
  }
};

module.exports = {
  generateBookingReport,
  generateVehicleReport,
  generateCustomerReport,
  generateDashboardSummary,
  exportReport
};
