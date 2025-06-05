const db = require('../models');
const Driver = db.Driver;
const Booking = db.Booking;
const { Op } = require('sequelize');

// Get all drivers
exports.getAllDrivers = async (req, res) => {
  try {
    const drivers = await Driver.findAll({
      where: {
        tenant_id: req.tenantId
      }
    });
    
    return res.status(200).json({
      success: true,
      data: drivers
    });
  } catch (error) {
    console.error('Error fetching drivers:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch drivers',
      error: error.message
    });
  }
};

// Get driver by ID
exports.getDriverById = async (req, res) => {
  try {
    const driver = await Driver.findOne({
      where: {
        id: req.params.id,
        tenant_id: req.tenantId
      }
    });
    
    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      data: driver
    });
  } catch (error) {
    console.error('Error fetching driver:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch driver',
      error: error.message
    });
  }
};

// Create new driver
exports.createDriver = async (req, res) => {
  try {
    // Add tenant ID to driver data
    const driverData = {
      ...req.body,
      tenant_id: req.tenantId
    };
    
    const driver = await Driver.create(driverData);
    
    return res.status(201).json({
      success: true,
      data: driver,
      message: 'Driver created successfully'
    });
  } catch (error) {
    console.error('Error creating driver:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create driver',
      error: error.message
    });
  }
};

// Update driver
exports.updateDriver = async (req, res) => {
  try {
    const driver = await Driver.findOne({
      where: {
        id: req.params.id,
        tenant_id: req.tenantId
      }
    });
    
    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver not found'
      });
    }
    
    await driver.update(req.body);
    
    return res.status(200).json({
      success: true,
      data: driver,
      message: 'Driver updated successfully'
    });
  } catch (error) {
    console.error('Error updating driver:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update driver',
      error: error.message
    });
  }
};

// Delete driver
exports.deleteDriver = async (req, res) => {
  try {
    const driver = await Driver.findOne({
      where: {
        id: req.params.id,
        tenant_id: req.tenantId
      }
    });
    
    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver not found'
      });
    }
    
    await driver.destroy();
    
    return res.status(200).json({
      success: true,
      message: 'Driver deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting driver:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete driver',
      error: error.message
    });
  }
};

// Get available drivers
exports.getAvailableDrivers = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    
    // Find drivers who don't have bookings in the specified time range
    const busyDriverIds = await Booking.findAll({
      attributes: ['driver_id'],
      where: {
        tenant_id: req.tenantId,
        driver_id: { [Op.ne]: null },
        [Op.or]: [
          {
            start_date: {
              [Op.between]: [start_date, end_date]
            }
          },
          {
            end_date: {
              [Op.between]: [start_date, end_date]
            }
          },
          {
            [Op.and]: [
              { start_date: { [Op.lte]: start_date } },
              { end_date: { [Op.gte]: end_date } }
            ]
          }
        ]
      },
      raw: true
    }).then(bookings => bookings.map(booking => booking.driver_id));
    
    const availableDrivers = await Driver.findAll({
      where: {
        tenant_id: req.tenantId,
        id: { [Op.notIn]: busyDriverIds },
        status: 'active'
      }
    });
    
    return res.status(200).json({
      success: true,
      data: availableDrivers
    });
  } catch (error) {
    console.error('Error fetching available drivers:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch available drivers',
      error: error.message
    });
  }
};

// Get driver bookings
exports.getDriverBookings = async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      where: {
        driver_id: req.params.id,
        tenant_id: req.tenantId
      }
    });
    
    return res.status(200).json({
      success: true,
      data: bookings
    });
  } catch (error) {
    console.error('Error fetching driver bookings:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch driver bookings',
      error: error.message
    });
  }
};
