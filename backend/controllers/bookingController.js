const Booking = require('../models/Booking');
const Vehicle = require('../models/Vehicle');
const Customer = require('../models/Customer');
const Driver = require('../models/Driver');
const VehicleModel = require('../models/VehicleModel');
const Notification = require('../models/Notification');
const { Op } = require('sequelize');
const sequelize = require('../models/index');
const moment = require('moment');

// Get all bookings
const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      include: [
        { model: Customer, as: 'customer' },
        { 
          model: Vehicle, 
          as: 'vehicle',
          include: [{ model: VehicleModel, as: 'model' }]
        },
        { model: Driver, as: 'driver' }
      ],
      order: [['pickup_date', 'DESC'], ['pickup_time', 'DESC']]
    });
    
    res.status(200).json({ bookings });
  } catch (error) {
    console.error('Get all bookings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get booking by ID
const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const booking = await Booking.findByPk(id, {
      include: [
        { model: Customer, as: 'customer' },
        { 
          model: Vehicle, 
          as: 'vehicle',
          include: [{ model: VehicleModel, as: 'model' }]
        },
        { model: Driver, as: 'driver' }
      ]
    });
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    res.status(200).json({ booking });
  } catch (error) {
    console.error('Get booking by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Check vehicle availability for booking
const checkVehicleAvailability = async (req, res) => {
  try {
    const { vehicle_id, pickup_date, pickup_time, return_date, return_time, exclude_booking_id } = req.body;
    
    // Validate required fields
    if (!vehicle_id || !pickup_date || !pickup_time || !return_date || !return_time) {
      return res.status(400).json({ 
        message: 'Vehicle ID, pickup date/time, and return date/time are required' 
      });
    }
    
    // Check if vehicle exists
    const vehicle = await Vehicle.findByPk(vehicle_id);
    
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }
    
    // Check if vehicle is in maintenance
    if (vehicle.status === 'maintenance') {
      return res.status(400).json({ 
        message: 'Vehicle is currently under maintenance',
        available: false
      });
    }
    
    // Format dates for comparison
    const pickupDateTime = `${pickup_date} ${pickup_time}`;
    const returnDateTime = `${return_date} ${return_time}`;
    
    // Build query to find conflicting bookings
    const whereClause = {
      vehicle_id,
      [Op.or]: [
        // New booking starts during an existing booking
        {
          [Op.and]: [
            sequelize.literal(`CONCAT(pickup_date, ' ', pickup_time) <= '${returnDateTime}'`),
            sequelize.literal(`CONCAT(return_date, ' ', return_time) >= '${pickupDateTime}'`)
          ]
        }
      ]
    };
    
    // Exclude current booking if updating
    if (exclude_booking_id) {
      whereClause.id = { [Op.ne]: exclude_booking_id };
    }
    
    // Check for conflicting bookings
    const conflictingBookings = await Booking.findAll({
      where: whereClause,
      include: [
        { model: Customer, as: 'customer' },
        { model: Vehicle, as: 'vehicle' }
      ]
    });
    
    if (conflictingBookings.length > 0) {
      return res.status(200).json({
        available: false,
        message: 'Vehicle is not available for the selected time period',
        conflicts: conflictingBookings.map(booking => ({
          id: booking.id,
          booking_id: booking.booking_id,
          customer: booking.customer ? booking.customer.full_name : 'Unknown',
          pickup: `${booking.pickup_date} ${booking.pickup_time}`,
          return: `${booking.return_date} ${booking.return_time}`
        }))
      });
    }
    
    res.status(200).json({
      available: true,
      message: 'Vehicle is available for the selected time period'
    });
  } catch (error) {
    console.error('Check vehicle availability error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create new booking
const createBooking = async (req, res) => {
  try {
    const { 
      customer_id, 
      vehicle_id, 
      driver_id, 
      pickup_date, 
      pickup_time, 
      return_date, 
      return_time, 
      pickup_location, 
      drop_location, 
      notes, 
      payment_status 
    } = req.body;
    
    // Check if customer exists
    const customer = await Customer.findByPk(customer_id);
    
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    
    // Check if vehicle exists
    const vehicle = await Vehicle.findByPk(vehicle_id);
    
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }
    
    // Check if driver exists if provided
    if (driver_id) {
      const driver = await Driver.findByPk(driver_id);
      
      if (!driver) {
        return res.status(404).json({ message: 'Driver not found' });
      }
    }
    
    // Check vehicle availability
    const pickupDateTime = `${pickup_date} ${pickup_time}`;
    const returnDateTime = `${return_date} ${return_time}`;
    
    const conflictingBookings = await Booking.findAll({
      where: {
        vehicle_id,
        [Op.or]: [
          // New booking starts during an existing booking
          {
            [Op.and]: [
              sequelize.literal(`CONCAT(pickup_date, ' ', pickup_time) <= '${returnDateTime}'`),
              sequelize.literal(`CONCAT(return_date, ' ', return_time) >= '${pickupDateTime}'`)
            ]
          }
        ]
      }
    });
    
    if (conflictingBookings.length > 0) {
      return res.status(400).json({
        message: 'Vehicle is not available for the selected time period',
        conflicts: conflictingBookings.map(booking => ({
          id: booking.id,
          booking_id: booking.booking_id,
          pickup: `${booking.pickup_date} ${booking.pickup_time}`,
          return: `${booking.return_date} ${booking.return_time}`
        }))
      });
    }
    
    // Create booking
    const booking = await Booking.create({
      customer_id,
      vehicle_id,
      driver_id,
      pickup_date,
      pickup_time,
      return_date,
      return_time,
      pickup_location,
      drop_location,
      notes,
      payment_status: payment_status || 'pending'
    });
    
    // Update vehicle status to booked
    await vehicle.update({ status: 'booked' });
    
    // Schedule notification for 24 hours before pickup
    const pickupMoment = moment(`${pickup_date} ${pickup_time}`);
    const notificationTime = pickupMoment.subtract(24, 'hours');
    const currentTime = moment();
    
    // Only schedule if pickup is more than 24 hours away
    if (notificationTime.isAfter(currentTime)) {
      // This would be handled by a scheduler in production
      // For now, we'll just create a notification record
      await Notification.create({
        booking_id: booking.id,
        type: customer.whatsapp ? 'whatsapp' : 'sms',
        recipient: customer.whatsapp || customer.phone,
        message: `Hello ${customer.full_name}, your rental car ${vehicle.license_plate} will be delivered on ${pickup_date} at ${pickup_time}. ${driver_id ? `Driver: ${(await Driver.findByPk(driver_id)).name}, Phone: ${(await Driver.findByPk(driver_id)).phone}` : 'No driver assigned.'}`,
        status: 'sent',
        sent_at: null // Will be updated when actually sent
      });
    }
    
    res.status(201).json({
      message: 'Booking created successfully',
      booking
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update booking
const updateBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      customer_id, 
      vehicle_id, 
      driver_id, 
      pickup_date, 
      pickup_time, 
      return_date, 
      return_time, 
      pickup_location, 
      drop_location, 
      notes, 
      payment_status 
    } = req.body;
    
    // Find booking
    const booking = await Booking.findByPk(id);
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Check if customer exists if provided
    if (customer_id) {
      const customer = await Customer.findByPk(customer_id);
      
      if (!customer) {
        return res.status(404).json({ message: 'Customer not found' });
      }
    }
    
    // Check if vehicle is changing
    let vehicleChanged = false;
    let oldVehicleId = booking.vehicle_id;
    
    if (vehicle_id && vehicle_id !== booking.vehicle_id) {
      // Check if new vehicle exists
      const vehicle = await Vehicle.findByPk(vehicle_id);
      
      if (!vehicle) {
        return res.status(404).json({ message: 'Vehicle not found' });
      }
      
      vehicleChanged = true;
    }
    
    // Check if driver exists if provided
    if (driver_id) {
      const driver = await Driver.findByPk(driver_id);
      
      if (!driver) {
        return res.status(404).json({ message: 'Driver not found' });
      }
    }
    
    // Check vehicle availability if dates or vehicle changed
    if ((pickup_date || pickup_time || return_date || return_time || vehicleChanged) && 
        (pickup_date || booking.pickup_date) && 
        (pickup_time || booking.pickup_time) && 
        (return_date || booking.return_date) && 
        (return_time || booking.return_time)) {
      
      const pickupDateTime = `${pickup_date || booking.pickup_date} ${pickup_time || booking.pickup_time}`;
      const returnDateTime = `${return_date || booking.return_date} ${return_time || booking.return_time}`;
      
      const conflictingBookings = await Booking.findAll({
        where: {
          vehicle_id: vehicle_id || booking.vehicle_id,
          id: { [Op.ne]: id }, // Exclude current booking
          [Op.or]: [
            // Updated booking overlaps with existing booking
            {
              [Op.and]: [
                sequelize.literal(`CONCAT(pickup_date, ' ', pickup_time) <= '${returnDateTime}'`),
                sequelize.literal(`CONCAT(return_date, ' ', return_time) >= '${pickupDateTime}'`)
              ]
            }
          ]
        }
      });
      
      if (conflictingBookings.length > 0) {
        return res.status(400).json({
          message: 'Vehicle is not available for the selected time period',
          conflicts: conflictingBookings.map(b => ({
            id: b.id,
            booking_id: b.booking_id,
            pickup: `${b.pickup_date} ${b.pickup_time}`,
            return: `${b.return_date} ${b.return_time}`
          }))
        });
      }
    }
    
    // Update booking
    await booking.update({
      customer_id: customer_id || booking.customer_id,
      vehicle_id: vehicle_id || booking.vehicle_id,
      driver_id: driver_id === null ? null : (driver_id || booking.driver_id),
      pickup_date: pickup_date || booking.pickup_date,
      pickup_time: pickup_time || booking.pickup_time,
      return_date: return_date || booking.return_date,
      return_time: return_time || booking.return_time,
      pickup_location: pickup_location || booking.pickup_location,
      drop_location: drop_location || booking.drop_location,
      notes: notes !== undefined ? notes : booking.notes,
      payment_status: payment_status || booking.payment_status
    });
    
    // Update vehicle statuses if vehicle changed
    if (vehicleChanged) {
      // Set old vehicle to available
      const oldVehicle = await Vehicle.findByPk(oldVehicleId);
      if (oldVehicle) {
        await oldVehicle.update({ status: 'available' });
      }
      
      // Set new vehicle to booked
      const newVehicle = await Vehicle.findByPk(vehicle_id);
      if (newVehicle) {
        await newVehicle.update({ status: 'booked' });
      }
    }
    
    // Update notification if pickup date/time changed
    if (pickup_date || pickup_time) {
      const customer = await Customer.findByPk(booking.customer_id);
      const vehicle = await Vehicle.findByPk(booking.vehicle_id);
      
      // Find existing notification
      const notification = await Notification.findOne({
        where: { booking_id: booking.id }
      });
      
      if (notification) {
        // Update notification message
        await notification.update({
          message: `Hello ${customer.full_name}, your rental car ${vehicle.license_plate} will be delivered on ${pickup_date || booking.pickup_date} at ${pickup_time || booking.pickup_time}. ${booking.driver_id ? `Driver: ${(await Driver.findByPk(booking.driver_id)).name}, Phone: ${(await Driver.findByPk(booking.driver_id)).phone}` : 'No driver assigned.'}`,
          sent_at: null // Reset sent time as it needs to be sent again
        });
      }
    }
    
    res.status(200).json({
      message: 'Booking updated successfully',
      booking: await Booking.findByPk(id, {
        include: [
          { model: Customer, as: 'customer' },
          { 
            model: Vehicle, 
            as: 'vehicle',
            include: [{ model: VehicleModel, as: 'model' }]
          },
          { model: Driver, as: 'driver' }
        ]
      })
    });
  } catch (error) {
    console.error('Update booking error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete booking
const deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;
    
    const booking = await Booking.findByPk(id);
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Get vehicle to update its status
    const vehicle = await Vehicle.findByPk(booking.vehicle_id);
    
    // Delete booking
    await booking.destroy();
    
    // Update vehicle status to available
    if (vehicle) {
      await vehicle.update({ status: 'available' });
    }
    
    // Delete associated notifications
    await Notification.destroy({
      where: { booking_id: id }
    });
    
    res.status(200).json({ message: 'Booking deleted successfully' });
  } catch (error) {
    console.error('Delete booking error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get bookings for calendar
const getBookingsForCalendar = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    
    // Validate dates
    if (!start_date || !end_date) {
      return res.status(400).json({ message: 'Start date and end date are required' });
    }
    
    // Get all bookings that overlap with the requested period
    const bookings = await Booking.findAll({
      where: {
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
      include: [
        { model: Customer, as: 'customer' },
        { 
          model: Vehicle, 
          as: 'vehicle',
          include: [{ model: VehicleModel, as: 'model' }]
        },
        { model: Driver, as: 'driver' }
      ]
    });
    
    // Format bookings for calendar
    const calendarEvents = bookings.map(booking => {
      const vehicleInfo = booking.vehicle ? 
        `${booking.vehicle.license_plate} (${booking.vehicle.model ? booking.vehicle.model.name : 'Unknown'})` : 
        'Unknown Vehicle';
      
      const customerName = booking.customer ? booking.customer.full_name : 'Unknown Customer';
      
      return {
        id: booking.id,
        booking_id: booking.booking_id,
        title: `${vehicleInfo} - ${customerName}`,
        start: `${booking.pickup_date}T${booking.pickup_time}`,
        end: `${booking.return_date}T${booking.return_time}`,
        vehicle_id: booking.vehicle_id,
        customer_id: booking.customer_id,
        driver_id: booking.driver_id,
        status: booking.payment_status,
        color: booking.payment_status === 'paid' ? '#28a745' : 
               booking.payment_status === 'pending' ? '#ffc107' : '#dc3545'
      };
    });
    
    res.status(200).json({ events: calendarEvents });
  } catch (error) {
    console.error('Get bookings for calendar error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get upcoming pickups
const getUpcomingPickups = async (req, res) => {
  try {
    const today = moment().format('YYYY-MM-DD');
    const tomorrow = moment().add(1, 'days').format('YYYY-MM-DD');
    
    const upcomingPickups = await Booking.findAll({
      where: {
        pickup_date: {
          [Op.between]: [today, tomorrow]
        }
      },
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
    
    res.status(200).json({ pickups: upcomingPickups });
  } catch (error) {
    console.error('Get upcoming pickups error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get pending payments
const getPendingPayments = async (req, res) => {
  try {
    const pendingPayments = await Booking.findAll({
      where: {
        payment_status: {
          [Op.in]: ['pending', 'hold']
        }
      },
      include: [
        { model: Customer, as: 'customer' },
        { 
          model: Vehicle, 
          as: 'vehicle',
          include: [{ model: VehicleModel, as: 'model' }]
        }
      ],
      order: [['pickup_date', 'ASC']]
    });
    
    res.status(200).json({ payments: pendingPayments });
  } catch (error) {
    console.error('Get pending payments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Search bookings
const searchBookings = async (req, res) => {
  try {
    const { 
      query, 
      customer_id, 
      vehicle_id, 
      driver_id, 
      start_date, 
      end_date, 
      payment_status 
    } = req.query;
    
    const whereClause = {};
    
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
      order: [['pickup_date', 'DESC'], ['pickup_time', 'DESC']]
    });
    
    res.status(200).json({ bookings });
  } catch (error) {
    console.error('Search bookings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAllBookings,
  getBookingById,
  checkVehicleAvailability,
  createBooking,
  updateBooking,
  deleteBooking,
  getBookingsForCalendar,
  getUpcomingPickups,
  getPendingPayments,
  searchBookings
};
