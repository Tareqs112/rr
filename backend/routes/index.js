const middleware = require('../middleware/auth');
const errorHandler = require('../middleware/errorHandler');
const tenantMiddleware = require('../middleware/tenant');

module.exports = (app) => {
  // ✅ مسارات تسجيل الدخول والتسجيل لا تحتاج JWT
  app.use('/api/auth', require('./auth'));

  // ✅ تطبيق المصادقة بعد auth
  app.use('/api', middleware.authenticate);

  // ✅ تطبيق التحقق من التينانت بعد التحقق من JWT
  app.use('/api', tenantMiddleware.validateTenant);

  // ✅ باقي المسارات بعد التحقق من المصادقة والتينانت
  app.use('/api/reports', require('./reports'));
  app.use('/api/customers', require('./customers'));
  app.use('/api/drivers', require('./drivers'));
  app.use('/api/companies', require('./companies'));
  app.use('/api/tour-campaigns', require('./tourCampaigns'));


  // ✅ صلاحيات التينانت فقط للمشرفين
  app.use('/api/admin/tenants', middleware.isSuperAdmin, require('./admin/tenants'));

  // ✅ معالج الأخطاء في النهاية
  app.use(errorHandler);
};
