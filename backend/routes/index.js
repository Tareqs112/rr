const middleware = require('../middleware/auth');
const errorHandler = require('../middleware/errorHandler');
const tenantMiddleware = require('../middleware/tenant');

module.exports = (app) => {
  // Auth routes
  app.use('/api/auth', require('./auth'));
  
  // Apply authentication middleware to all routes below
  app.use('/api', middleware.authenticate);
  
  // Apply tenant middleware for multi-tenant isolation
  app.use('/api', tenantMiddleware.validateTenant);
  
  // API routes
  app.use('/api/customers', require('./customers'));
  app.use('/api/vehicles', require('./vehicles'));
  app.use('/api/drivers', require('./drivers'));
  app.use('/api/bookings', require('./bookings'));
  app.use('/api/reports', require('./reports'));
  app.use('/api/notifications', require('./notifications'));
  app.use('/api/companies', require('./companies'));
  app.use('/api/payments', require('./payments'));
  app.use('/api/hotel-bookings', require('./hotelBookings'));
  app.use('/api/flight-bookings', require('./flightBookings'));
  app.use('/api/tour-packages', require('./tourPackages'));
  
  // Admin routes for tenant management (only accessible by super admins)
  app.use('/api/admin/tenants', middleware.isSuperAdmin, require('./admin/tenants'));
  
  // Apply global error handler
  app.use(errorHandler);
};
