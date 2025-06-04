const Driver = require('../models/Driver');
const Booking = require('../models/Booking');
const { Op } = require('sequelize');

// Get all drivers
const getAllDrivers = async (req, res) => {
  try {
    const drivers = await Driver.findAll({
      order: [['name', 'ASC']]
    });
    res.status(200).json({ drivers });
  } catch (error) {
    console.error('Get all drivers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get driver by ID
const getDriverById = async (req, res) => {
  try {
    const { id } = req.params;
    const driver = await Driver.findByPk(id);
    
    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }
    
    res.status(200).json({ driver });
  } catch (error) {
    console.error('Get driver by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create new driver
const createDriver = async (req, res) => {
  try {
    const { name, phone, license_number, languages, status } = req.body;
    
    // Check if license number is already in use
    const existingDriver = await Driver.findOne({ where: { license_number } });
    
    if (existingDriver) {
      return res.status(409).json({ message: 'License number already in use' });
    }
    
    const driver = await Driver.create({
      name,
      phone,
      license_number,
      languages,
      status: status || 'available'
    });
    
    res.status(201).json({
      message: 'Driver created successfully',
      driver
    });
  } catch (error) {
    console.error('Create driver error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update driver
const updateDriver = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, license_number, languages, status } = req.body;
    
    const driver = await Driver.findByPk(id);
    
    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }
    
    // Check if license number is already in use by another driver
    if (license_number && license_number !== driver.license_number) {
      const existingDriver = await Driver.findOne({ where: { license_number } });
      
      if (existingDriver) {
        return res.status(409).json({ message: 'License number already in use' });
      }
    }
    
    await driver.update({
      name: name || driver.name,
      phone: phone || driver.phone,
      license_number: license_number || driver.license_number,
      languages: languages || driver.languages,
      status: status || driver.status
    });
    
    res.status(200).json({
      message: 'Driver updated successfully',
      driver
    });
  } catch (error) {
    console.error('Update driver error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete driver
const deleteDriver = async (req, res) => {
  try {
    const { id } = req.params;
    
    const driver = await Driver.findByPk(id);
    
    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }
    
    // Check if driver has bookings
    const bookings = await Booking.findOne({ where: { driver_id: id } });
    
    if (bookings) {
      return res.status(400).json({ 
        message: 'Cannot delete driver with existing bookings' 
      });
    }
    
    await driver.destroy();
    
    res.status(200).json({ message: 'Driver deleted successfully' });
  } catch (error) {
    console.error('Delete driver error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get available drivers
const getAvailableDrivers = async (req, res) => {
  try {
    const { start_date, start_time, end_date, end_time } = req.query;
    
    // If no dates provided, just return drivers with 'available' status
    if (!start_date || !end_date) {
      const availableDrivers = await Driver.findAll({
        where: { status: 'available' },
        order: [['name', 'ASC']]
      });
      
      return res.status(200).json({ drivers: availableDrivers });
    }
    
    // Get all drivers with 'available' status
    const availableDrivers = await Driver.findAll({
      where: { status: 'available' }
    });
    
    // Get all bookings that overlap with the requested period
    const bookings = await Booking.findAll({
      where: {
        driver_id: {
          [Op.in]: availableDrivers.map(driver => driver.id)
        },
        [Op.or]: [
          {
            // Booking starts during the requested period
            [Op.and]: [
              { pickup_date: { [Op.gte]: start_date } },
              { pickup_date: { [Op.lte]: end_date } }
            ]
          },
          {
            // Booking ends during the requested period
            [Op.and]: [
              { return_date: { [Op.gte]: start_date } },
              { return_date: { [Op.lte]: end_date } }
            ]
          },
          {
            // Booking spans the entire requested period
            [Op.and]: [
              { pickup_date: { [Op.lte]: start_date } },
              { return_date: { [Op.gte]: end_date } }
            ]
          }
        ]
      }
    });
    
    // Create a set of booked driver IDs
    const bookedDriverIds = new Set(bookings.map(booking => booking.driver_id));
    
    // Filter out booked drivers
    const availableDriversList = availableDrivers.filter(driver => !bookedDriverIds.has(driver.id));
    
    res.status(200).json({ drivers: availableDriversList });
  } catch (error) {
    console.error('Get available drivers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get driver bookings
const getDriverBookings = async (req, res) => {
  try {
    const { id } = req.params;
    const { start_date, end_date } = req.query;
    
    const driver = await Driver.findByPk(id);
    
    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }
    
    // Build query conditions
    const whereClause = { driver_id: id };
    
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
      order: [['pickup_date', 'ASC'], ['pickup_time', 'ASC']]
    });
    
    res.status(200).json({ bookings });
  } catch (error) {
    console.error('Get driver bookings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAllDrivers,
  getDriverById,
  createDriver,
  updateDriver,
  deleteDriver,
  getAvailableDrivers,
  getDriverBookings
};
