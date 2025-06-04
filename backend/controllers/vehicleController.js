const VehicleModel = require('../models/VehicleModel');
const Vehicle = require('../models/Vehicle');
const Booking = require('../models/Booking');
const { Op } = require('sequelize');
const sequelize = require('../models/index');

// Get all vehicle models
const getAllVehicleModels = async (req, res) => {
  try {
    const models = await VehicleModel.findAll({
      order: [['name', 'ASC']]
    });
    res.status(200).json({ models });
  } catch (error) {
    console.error('Get all vehicle models error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get vehicle model by ID
const getVehicleModelById = async (req, res) => {
  try {
    const { id } = req.params;
    const model = await VehicleModel.findByPk(id);
    
    if (!model) {
      return res.status(404).json({ message: 'Vehicle model not found' });
    }
    
    res.status(200).json({ model });
  } catch (error) {
    console.error('Get vehicle model by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create new vehicle model
const createVehicleModel = async (req, res) => {
  try {
    const { name, description } = req.body;
    
    const model = await VehicleModel.create({
      name,
      description
    });
    
    res.status(201).json({
      message: 'Vehicle model created successfully',
      model
    });
  } catch (error) {
    console.error('Create vehicle model error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update vehicle model
const updateVehicleModel = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    
    const model = await VehicleModel.findByPk(id);
    
    if (!model) {
      return res.status(404).json({ message: 'Vehicle model not found' });
    }
    
    await model.update({
      name,
      description
    });
    
    res.status(200).json({
      message: 'Vehicle model updated successfully',
      model
    });
  } catch (error) {
    console.error('Update vehicle model error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete vehicle model
const deleteVehicleModel = async (req, res) => {
  try {
    const { id } = req.params;
    
    const model = await VehicleModel.findByPk(id);
    
    if (!model) {
      return res.status(404).json({ message: 'Vehicle model not found' });
    }
    
    // Check if model has vehicles
    const vehicles = await Vehicle.findOne({ where: { model_id: id } });
    
    if (vehicles) {
      return res.status(400).json({ 
        message: 'Cannot delete model with existing vehicles' 
      });
    }
    
    await model.destroy();
    
    res.status(200).json({ message: 'Vehicle model deleted successfully' });
  } catch (error) {
    console.error('Delete vehicle model error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all vehicles
const getAllVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.findAll({
      include: [{ model: VehicleModel, as: 'model' }],
      order: [['license_plate', 'ASC']]
    });
    res.status(200).json({ vehicles });
  } catch (error) {
    console.error('Get all vehicles error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get vehicle by ID
const getVehicleById = async (req, res) => {
  try {
    const { id } = req.params;
    const vehicle = await Vehicle.findByPk(id, {
      include: [{ model: VehicleModel, as: 'model' }]
    });
    
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }
    
    res.status(200).json({ vehicle });
  } catch (error) {
    console.error('Get vehicle by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create new vehicle
const createVehicle = async (req, res) => {
  try {
    const { model_id, license_plate, insurance_expiry, license_expiry, status } = req.body;
    
    // Check if model exists
    const model = await VehicleModel.findByPk(model_id);
    
    if (!model) {
      return res.status(404).json({ message: 'Vehicle model not found' });
    }
    
    // Check if license plate is already in use
    const existingVehicle = await Vehicle.findOne({ where: { license_plate } });
    
    if (existingVehicle) {
      return res.status(409).json({ message: 'License plate already in use' });
    }
    
    const vehicle = await Vehicle.create({
      model_id,
      license_plate,
      insurance_expiry,
      license_expiry,
      status: status || 'available'
    });
    
    res.status(201).json({
      message: 'Vehicle created successfully',
      vehicle
    });
  } catch (error) {
    console.error('Create vehicle error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update vehicle
const updateVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    const { model_id, license_plate, insurance_expiry, license_expiry, status } = req.body;
    
    const vehicle = await Vehicle.findByPk(id);
    
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }
    
    // Check if model exists if model_id is provided
    if (model_id) {
      const model = await VehicleModel.findByPk(model_id);
      
      if (!model) {
        return res.status(404).json({ message: 'Vehicle model not found' });
      }
    }
    
    // Check if license plate is already in use by another vehicle
    if (license_plate && license_plate !== vehicle.license_plate) {
      const existingVehicle = await Vehicle.findOne({ where: { license_plate } });
      
      if (existingVehicle) {
        return res.status(409).json({ message: 'License plate already in use' });
      }
    }
    
    await vehicle.update({
      model_id: model_id || vehicle.model_id,
      license_plate: license_plate || vehicle.license_plate,
      insurance_expiry: insurance_expiry || vehicle.insurance_expiry,
      license_expiry: license_expiry || vehicle.license_expiry,
      status: status || vehicle.status
    });
    
    res.status(200).json({
      message: 'Vehicle updated successfully',
      vehicle
    });
  } catch (error) {
    console.error('Update vehicle error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete vehicle
const deleteVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    
    const vehicle = await Vehicle.findByPk(id);
    
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }
    
    // Check if vehicle has bookings
    const bookings = await Booking.findOne({ where: { vehicle_id: id } });
    
    if (bookings) {
      return res.status(400).json({ 
        message: 'Cannot delete vehicle with existing bookings' 
      });
    }
    
    await vehicle.destroy();
    
    res.status(200).json({ message: 'Vehicle deleted successfully' });
  } catch (error) {
    console.error('Delete vehicle error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get vehicle availability
const getVehicleAvailability = async (req, res) => {
  try {
    const { start_date, end_date, model_id } = req.query;
    
    // Validate dates
    if (!start_date || !end_date) {
      return res.status(400).json({ message: 'Start date and end date are required' });
    }
    
    // Build query conditions
    const whereClause = {};
    
    if (model_id) {
      whereClause.model_id = model_id;
    }
    
    // Get all vehicles matching the criteria
    const vehicles = await Vehicle.findAll({
      where: whereClause,
      include: [{ model: VehicleModel, as: 'model' }]
    });
    
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
      }
    });
    
    // Create a map of booked vehicle IDs
    const bookedVehicleIds = new Set(bookings.map(booking => booking.vehicle_id));
    
    // Mark vehicles as available or booked
    const availability = vehicles.map(vehicle => {
      const isBooked = bookedVehicleIds.has(vehicle.id) || vehicle.status === 'maintenance';
      
      return {
        id: vehicle.id,
        license_plate: vehicle.license_plate,
        model: vehicle.model ? vehicle.model.name : 'Unknown Model',
        status: vehicle.status,
        is_available: !isBooked && vehicle.status === 'available'
      };
    });
    
    // Group by model
    const availabilityByModel = {};
    
    availability.forEach(vehicle => {
      if (!availabilityByModel[vehicle.model]) {
        availabilityByModel[vehicle.model] = {
          total: 0,
          available: 0,
          vehicles: []
        };
      }
      
      availabilityByModel[vehicle.model].total++;
      if (vehicle.is_available) {
        availabilityByModel[vehicle.model].available++;
      }
      availabilityByModel[vehicle.model].vehicles.push(vehicle);
    });
    
    res.status(200).json({ availability: availabilityByModel });
  } catch (error) {
    console.error('Get vehicle availability error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get vehicles by model
const getVehiclesByModel = async (req, res) => {
  try {
    const { model_id } = req.params;
    
    const model = await VehicleModel.findByPk(model_id);
    
    if (!model) {
      return res.status(404).json({ message: 'Vehicle model not found' });
    }
    
    const vehicles = await Vehicle.findAll({
      where: { model_id },
      order: [['license_plate', 'ASC']]
    });
    
    res.status(200).json({
      model,
      vehicles,
      total: vehicles.length,
      available: vehicles.filter(v => v.status === 'available').length
    });
  } catch (error) {
    console.error('Get vehicles by model error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get vehicle availability calendar
const getVehicleCalendar = async (req, res) => {
  try {
    const { vehicle_id, start_date, end_date } = req.query;
    
    // Validate dates
    if (!start_date || !end_date) {
      return res.status(400).json({ message: 'Start date and end date are required' });
    }
    
    // Build query conditions
    const whereClause = {};
    
    if (vehicle_id) {
      whereClause.vehicle_id = vehicle_id;
    }
    
    // Add date range condition
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
    
    // Get all bookings that overlap with the requested period
    const bookings = await Booking.findAll({
      where: whereClause,
      include: [
        { model: Vehicle, as: 'vehicle', include: [{ model: VehicleModel, as: 'model' }] }
      ]
    });
    
    // Format bookings for calendar
    const calendarEvents = bookings.map(booking => {
      return {
        id: booking.id,
        booking_id: booking.booking_id,
        title: booking.vehicle ? `${booking.vehicle.license_plate} (${booking.vehicle.model ? booking.vehicle.model.name : 'Unknown'})` : 'Unknown Vehicle',
        start: `${booking.pickup_date}T${booking.pickup_time}`,
        end: `${booking.return_date}T${booking.return_time}`,
        vehicle_id: booking.vehicle_id,
        status: booking.payment_status
      };
    });
    
    res.status(200).json({ events: calendarEvents });
  } catch (error) {
    console.error('Get vehicle calendar error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get vehicle availability summary
const getAvailabilitySummary = async (req, res) => {
  try {
    // Get count of all vehicles
    const totalVehicles = await Vehicle.count();
    
    // Get count of available vehicles
    const availableVehicles = await Vehicle.count({
      where: { status: 'available' }
    });
    
    // Get count of booked vehicles
    const bookedVehicles = await Vehicle.count({
      where: { status: 'booked' }
    });
    
    // Get count of maintenance vehicles
    const maintenanceVehicles = await Vehicle.count({
      where: { status: 'maintenance' }
    });
    
    // Get count by model
    const modelCounts = await Vehicle.findAll({
      attributes: [
        'model_id',
        [sequelize.fn('COUNT', sequelize.col('id')), 'total'],
        [sequelize.fn('SUM', sequelize.literal("CASE WHEN status = 'available' THEN 1 ELSE 0 END")), 'available']
      ],
      include: [{ model: VehicleModel, as: 'model', attributes: ['name'] }],
      group: ['model_id'],
      raw: true
    });
    
    res.status(200).json({
      summary: {
        total: totalVehicles,
        available: availableVehicles,
        booked: bookedVehicles,
        maintenance: maintenanceVehicles
      },
      by_model: modelCounts
    });
  } catch (error) {
    console.error('Get availability summary error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAllVehicleModels,
  getVehicleModelById,
  createVehicleModel,
  updateVehicleModel,
  deleteVehicleModel,
  getAllVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  getVehicleAvailability,
  getVehiclesByModel,
  getVehicleCalendar,
  getAvailabilitySummary
};
