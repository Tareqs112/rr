const Booking = require('../models/Booking');
const Customer = require('../models/Customer');
const Vehicle = require('../models/Vehicle');
const VehicleModel = require('../models/VehicleModel');
const Driver = require('../models/Driver');
const { Op } = require('sequelize');
const sequelize = require('../models/index');
const moment = require('moment');
const fs = require('fs');
const path = require('path');
const { Parser } = require('json2csv');

// Generate booking report
const generateBookingReport = async (req, res) => {
  try {
    const { start_date, end_date, customer_id, vehicle_id, driver_id, payment_status, format } = req.query;
    
    // Build query conditions
    const whereClause = {};
    
    if (start_date && end_date) {
      whereClause[Op.or] = [
        {
          // Booking starts during the requested period
          pickup_date: {
            [Op.between]: [start_date, end_date]
          }
        },
        {
          // Booking ends during the requested period
          return_date: {
            [Op.between]: [start_date, end_date]
          }
        },
        {
          // Booking spans the entire requested period
          [Op.and]: [
            { pickup_date: { [Op.lte]: start_date } },
            { return_date: { [Op.gte]: end_date } }
          ]
        }
      ];
    }
    
    if (customer_id) {
      whereClause.customer_id = customer_id;
    }
    
    if (vehicle_id) {
      whereClause.vehicle_id = vehicle_id;
    }
    
    if (driver_id) {
      whereClause.driver_id = driver_id;
    }
    
    if (payment_status) {
      whereClause.payment_status = payment_status;
    }
    
    // Get bookings
    const bookings = await Booking.findAll({
      where: whereClause,
      include: [
        { model: Customer, as: 'customer' },
        { 
          model: Vehicle, 
          as: 'vehicle',
          include: [{ model: VehicleModel, as: 'model' }]
        },
        { model: Driver, as: 'driver' }
      ],
      order: [['pickup_date', 'ASC'], ['pickup_time', 'ASC']]
    });
    
    // Format data for report
    const reportData = bookings.map(booking => {
      return {
        booking_id: booking.booking_id,
        customer_name: booking.customer ? booking.customer.full_name : 'Unknown',
        customer_phone: booking.customer ? booking.customer.phone : 'Unknown',
        vehicle: booking.vehicle ? 
          `${booking.vehicle.license_plate} (${booking.vehicle.model ? booking.vehicle.model.name : 'Unknown'})` : 
          'Unknown',
        driver: booking.driver ? booking.driver.name : 'No Driver',
        pickup_date: booking.pickup_date,
        pickup_time: booking.pickup_time,
        return_date: booking.return_date,
        return_time: booking.return_time,
        pickup_location: booking.pickup_location,
        drop_location: booking.drop_location,
        payment_status: booking.payment_status,
        created_at: booking.createdAt
      };
    });
    
    // Return data based on requested format
    if (format === 'csv') {
      // Generate CSV
      const fields = Object.keys(reportData[0] || {});
      const parser = new Parser({ fields });
      const csv = reportData.length ? parser.parse(reportData) : '';
      
      // Set headers for file download
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=bookings_report_${moment().format('YYYY-MM-DD')}.csv`);
      
      return res.status(200).send(csv);
    } else if (format === 'pdf') {
      // For PDF, we would typically use a library like PDFKit or html-pdf
      // For this implementation, we'll return a message that PDF generation would happen here
      return res.status(200).json({
        message: 'PDF generation would be implemented here in production',
        data: reportData
      });
    } else {
      // Default to JSON
      return res.status(200).json({
        report: {
          title: 'Booking Report',
          generated_at: moment().format('YYYY-MM-DD HH:mm:ss'),
          filters: {
            start_date,
            end_date,
            customer_id,
            vehicle_id,
            driver_id,
            payment_status
          },
          total_bookings: reportData.length,
          data: reportData
        }
      });
    }
  } catch (error) {
    console.error('Generate booking report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Generate vehicle report
const generateVehicleReport = async (req, res) => {
  try {
    const { start_date, end_date, model_id, status, format } = req.query;
    
    // Build query conditions for vehicles
    const vehicleWhereClause = {};
    
    if (model_id) {
      vehicleWhereClause.model_id = model_id;
    }
    
    if (status) {
      vehicleWhereClause.status = status;
    }
    
    // Get vehicles
    const vehicles = await Vehicle.findAll({
      where: vehicleWhereClause,
      include: [{ model: VehicleModel, as: 'model' }],
      order: [['license_plate', 'ASC']]
    });
    
    // Get bookings for each vehicle if date range provided
    let bookingsByVehicle = {};
    
    if (start_date && end_date) {
      const bookings = await Booking.findAll({
        where: {
          vehicle_id: {
            [Op.in]: vehicles.map(v => v.id)
          },
          [Op.or]: [
            {
              // Booking starts during the requested period
              pickup_date: {
                [Op.between]: [start_date, end_date]
              }
            },
            {
              // Booking ends during the requested period
              return_date: {
                [Op.between]: [start_date, end_date]
              }
            },
            {
              // Booking spans the entire requested period
              [Op.and]: [
                { pickup_date: { [Op.lte]: start_date } },
                { return_date: { [Op.gte]: end_date } }
              ]
            }
          ]
        },
        include: [{ model: Customer, as: 'customer' }]
      });
      
      // Group bookings by vehicle
      bookingsByVehicle = bookings.reduce((acc, booking) => {
        if (!acc[booking.vehicle_id]) {
          acc[booking.vehicle_id] = [];
        }
        acc[booking.vehicle_id].push(booking);
        return acc;
      }, {});
    }
    
    // Format data for report
    const reportData = vehicles.map(vehicle => {
      const vehicleBookings = bookingsByVehicle[vehicle.id] || [];
      const totalBookingDays = vehicleBookings.reduce((total, booking) => {
        const pickupDate = moment(booking.pickup_date);
        const returnDate = moment(booking.return_date);
        const days = returnDate.diff(pickupDate, 'days') + 1; // Include both pickup and return days
        return total + days;
      }, 0);
      
      return {
        id: vehicle.id,
        license_plate: vehicle.license_plate,
        model: vehicle.model ? vehicle.model.name : 'Unknown',
        status: vehicle.status,
        insurance_expiry: vehicle.insurance_expiry,
        license_expiry: vehicle.license_expiry,
        total_bookings: vehicleBookings.length,
        total_booking_days: totalBookingDays,
        utilization_rate: start_date && end_date ? 
          (totalBookingDays / moment(end_date).diff(moment(start_date), 'days') * 100).toFixed(2) + '%' : 
          'N/A'
      };
    });
    
    // Return data based on requested format
    if (format === 'csv') {
      // Generate CSV
      const fields = Object.keys(reportData[0] || {});
      const parser = new Parser({ fields });
      const csv = reportData.length ? parser.parse(reportData) : '';
      
      // Set headers for file download
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=vehicle_report_${moment().format('YYYY-MM-DD')}.csv`);
      
      return res.status(200).send(csv);
    } else if (format === 'pdf') {
      // For PDF, we would typically use a library like PDFKit or html-pdf
      // For this implementation, we'll return a message that PDF generation would happen here
      return res.status(200).json({
        message: 'PDF generation would be implemented here in production',
        data: reportData
      });
    } else {
      // Default to JSON
      return res.status(200).json({
        report: {
          title: 'Vehicle Report',
          generated_at: moment().format('YYYY-MM-DD HH:mm:ss'),
          filters: {
            start_date,
            end_date,
            model_id,
            status
          },
          total_vehicles: reportData.length,
          data: reportData
        }
      });
    }
  } catch (error) {
    console.error('Generate vehicle report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Generate customer report
const generateCustomerReport = async (req, res) => {
  try {
    const { start_date, end_date, is_vip, is_repeat_customer, format } = req.query;
    
    // Build query conditions for customers
    const customerWhereClause = {};
    
    if (is_vip !== undefined) {
      customerWhereClause.is_vip = is_vip === 'true';
    }
    
    if (is_repeat_customer !== undefined) {
      customerWhereClause.is_repeat_customer = is_repeat_customer === 'true';
    }
    
    // Get customers
    const customers = await Customer.findAll({
      where: customerWhereClause,
      order: [['full_name', 'ASC']]
    });
    
    // Get bookings for each customer if date range provided
    let bookingsByCustomer = {};
    
    if (start_date && end_date) {
      const bookings = await Booking.findAll({
        where: {
          customer_id: {
            [Op.in]: customers.map(c => c.id)
          },
          [Op.or]: [
            {
              // Booking starts during the requested period
              pickup_date: {
                [Op.between]: [start_date, end_date]
              }
            },
            {
              // Booking ends during the requested period
              return_date: {
                [Op.between]: [start_date, end_date]
              }
            },
            {
              // Booking spans the entire requested period
              [Op.and]: [
                { pickup_date: { [Op.lte]: start_date } },
                { return_date: { [Op.gte]: end_date } }
              ]
            }
          ]
        },
        include: [{ 
          model: Vehicle, 
          as: 'vehicle',
          include: [{ model: VehicleModel, as: 'model' }]
        }]
      });
      
      // Group bookings by customer
      bookingsByCustomer = bookings.reduce((acc, booking) => {
        if (!acc[booking.customer_id]) {
          acc[booking.customer_id] = [];
        }
        acc[booking.customer_id].push(booking);
        return acc;
      }, {});
    }
    
    // Format data for report
    const reportData = customers.map(customer => {
      const customerBookings = bookingsByCustomer[customer.id] || [];
      
      return {
        id: customer.id,
        full_name: customer.full_name,
        nationality: customer.nationality,
        phone: customer.phone,
        company_name: customer.company_name,
        is_vip: customer.is_vip ? 'Yes' : 'No',
        is_repeat_customer: customer.is_repeat_customer ? 'Yes' : 'No',
        total_bookings: customerBookings.length,
        most_rented_model: customerBookings.length > 0 ? 
          getMostFrequent(customerBookings.map(b => b.vehicle?.model?.name || 'Unknown')) : 
          'N/A'
      };
    });
    
    // Return data based on requested format
    if (format === 'csv') {
      // Generate CSV
      const fields = Object.keys(reportData[0] || {});
      const parser = new Parser({ fields });
      const csv = reportData.length ? parser.parse(reportData) : '';
      
      // Set headers for file download
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=customer_report_${moment().format('YYYY-MM-DD')}.csv`);
      
      return res.status(200).send(csv);
    } else if (format === 'pdf') {
      // For PDF, we would typically use a library like PDFKit or html-pdf
      // For this implementation, we'll return a message that PDF generation would happen here
      return res.status(200).json({
        message: 'PDF generation would be implemented here in production',
        data: reportData
      });
    } else {
      // Default to JSON
      return res.status(200).json({
        report: {
          title: 'Customer Report',
          generated_at: moment().format('YYYY-MM-DD HH:mm:ss'),
          filters: {
            start_date,
            end_date,
            is_vip: is_vip === 'true' ? 'Yes' : is_vip === 'false' ? 'No' : 'All',
            is_repeat_customer: is_repeat_customer === 'true' ? 'Yes' : is_repeat_customer === 'false' ? 'No' : 'All'
          },
          total_customers: reportData.length,
          data: reportData
        }
      });
    }
  } catch (error) {
    console.error('Generate customer report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Generate dashboard summary
const generateDashboardSummary = async (req, res) => {
  try {
    const today = moment().format('YYYY-MM-DD');
    const tomorrow = moment().add(1, 'days').format('YYYY-MM-DD');
    const thisMonth = moment().startOf('month').format('YYYY-MM-DD');
    const nextMonth = moment().add(1, 'month').startOf('month').format('YYYY-MM-DD');
    
    // Get total bookings
    const totalBookings = await Booking.count();
    
    // Get bookings this month
    const bookingsThisMonth = await Booking.count({
      where: {
        [Op.or]: [
          {
            pickup_date: {
              [Op.between]: [thisMonth, nextMonth]
            }
          },
          {
            return_date: {
              [Op.between]: [thisMonth, nextMonth]
            }
          }
        ]
      }
    });
    
    // Get upcoming pickups today
    const upcomingPickups = await Booking.count({
      where: {
        pickup_date: today
      }
    });
    
    // Get pending payments
    const pendingPayments = await Booking.count({
      where: {
        payment_status: {
          [Op.in]: ['pending', 'hold']
        }
      }
    });
    
    // Get vehicle availability
    const totalVehicles = await Vehicle.count();
    const availableVehicles = await Vehicle.count({
      where: { status: 'available' }
    });
    const bookedVehicles = await Vehicle.count({
      where: { status: 'booked' }
    });
    const maintenanceVehicles = await Vehicle.count({
      where: { status: 'maintenance' }
    });
    
    // Get bookings by payment status
    const bookingsByPaymentStatus = await Booking.findAll({
      attributes: [
        'payment_status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['payment_status']
    });
    
    // Get bookings by month (last 6 months)
    const sixMonthsAgo = moment().subtract(5, 'months').startOf('month');
    const bookingsByMonth = [];
    
    for (let i = 0; i < 6; i++) {
      const month = moment(sixMonthsAgo).add(i, 'months');
      const startOfMonth = month.format('YYYY-MM-DD');
      const endOfMonth = moment(month).endOf('month').format('YYYY-MM-DD');
      
      const count = await Booking.count({
        where: {
          [Op.or]: [
            {
              pickup_date: {
                [Op.between]: [startOfMonth, endOfMonth]
              }
            },
            {
              return_date: {
                [Op.between]: [startOfMonth, endOfMonth]
              }
            }
          ]
        }
      });
      
      bookingsByMonth.push({
        month: month.format('MMM YYYY'),
        count
      });
    }
    
    res.status(200).json({
      summary: {
        total_bookings: totalBookings,
        bookings_this_month: bookingsThisMonth,
        upcoming_pickups: upcomingPickups,
        pending_payments: pendingPayments,
        vehicles: {
          total: totalVehicles,
          available: availableVehicles,
          booked: bookedVehicles,
          maintenance: maintenanceVehicles,
          availability_rate: totalVehicles > 0 ? 
            (availableVehicles / totalVehicles * 100).toFixed(2) + '%' : 
            '0%'
        },
        bookings_by_payment_status: bookingsByPaymentStatus.map(item => ({
          status: item.payment_status,
          count: item.get('count')
        })),
        bookings_by_month: bookingsByMonth
      }
    });
  } catch (error) {
    console.error('Generate dashboard summary error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Helper function to get most frequent item in an array
function getMostFrequent(arr) {
  if (!arr.length) return null;
  
  const counts = arr.reduce((acc, val) => {
    acc[val] = (acc[val] || 0) + 1;
    return acc;
  }, {});
  
  return Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
}

module.exports = {
  generateBookingReport,
  generateVehicleReport,
  generateCustomerReport,
  generateDashboardSummary
};
