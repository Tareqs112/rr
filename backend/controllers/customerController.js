const db = require('../models');
const Customer = db.Customer;
const Booking = db.Booking;
const { Op } = require('sequelize');

// Get all customers
exports.getAllCustomers = async (req, res) => {
  try {
    const customers = await Customer.findAll({
      where: {
        tenant_id: req.tenantId
      }
    });
    
    return res.status(200).json({
      success: true,
      data: customers
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch customers',
      error: error.message
    });
  }
};

// Get customer by ID
exports.getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findOne({
      where: {
        id: req.params.id,
        tenant_id: req.tenantId
      }
    });
    
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      data: customer
    });
  } catch (error) {
    console.error('Error fetching customer:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch customer',
      error: error.message
    });
  }
};

// Create new customer
exports.createCustomer = async (req, res) => {
  try {
    // Add tenant ID to customer data
    const customerData = {
      ...req.body,
      tenant_id: req.tenantId
    };
    
    const customer = await Customer.create(customerData);
    
    return res.status(201).json({
      success: true,
      data: customer,
      message: 'Customer created successfully'
    });
  } catch (error) {
    console.error('Error creating customer:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create customer',
      error: error.message
    });
  }
};

// Update customer
exports.updateCustomer = async (req, res) => {
  try {
    const customer = await Customer.findOne({
      where: {
        id: req.params.id,
        tenant_id: req.tenantId
      }
    });
    
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }
    
    await customer.update(req.body);
    
    return res.status(200).json({
      success: true,
      data: customer,
      message: 'Customer updated successfully'
    });
  } catch (error) {
    console.error('Error updating customer:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update customer',
      error: error.message
    });
  }
};

// Delete customer
exports.deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findOne({
      where: {
        id: req.params.id,
        tenant_id: req.tenantId
      }
    });
    
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }
    
    await customer.destroy();
    
    return res.status(200).json({
      success: true,
      message: 'Customer deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting customer:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete customer',
      error: error.message
    });
  }
};

// Get customer bookings
exports.getCustomerBookings = async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      where: {
        customer_id: req.params.id,
        tenant_id: req.tenantId
      }
    });
    
    return res.status(200).json({
      success: true,
      data: bookings
    });
  } catch (error) {
    console.error('Error fetching customer bookings:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch customer bookings',
      error: error.message
    });
  }
};

// Placeholder for getCustomerFinancials
exports.getCustomerFinancials = async (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'getCustomerFinancials not implemented yet'
  });
};

// Placeholder for createCustomerPayment
exports.createCustomerPayment = async (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'createCustomerPayment not implemented yet'
  });
};


// Search customers
exports.searchCustomers = async (req, res) => {
  try {
    const { query } = req.query;
    
    const customers = await Customer.findAll({
      where: {
        tenant_id: req.tenantId,
        [Op.or]: [
          { full_name: { [Op.like]: `%${query}%` } },
          { email: { [Op.like]: `%${query}%` } },
          { phone: { [Op.like]: `%${query}%` } }
        ]
      }
    });
    
    return res.status(200).json({
      success: true,
      data: customers
    });
  } catch (error) {
    console.error('Error searching customers:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to search customers',
      error: error.message
    });
  }
};
