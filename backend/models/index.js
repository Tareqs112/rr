const { Sequelize } = require('sequelize');
const config = require('../config/database');

// إنشاء اتصال قاعدة البيانات
const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    dialect: config.dialect,
    logging: config.logging
  }
);

// تصدير اتصال قاعدة البيانات
const db = {
  sequelize,
  Sequelize
};

// 🟢 تحميل نموذج Tenant أولاً لأنه يُستخدم في علاقات لاحقة
const TenantDef = require('./Tenant');
const Tenant = TenantDef(sequelize, Sequelize.DataTypes);

// 🟡 تحميل باقي النماذج
const User = require('./User')(sequelize, Sequelize.DataTypes);
const Customer = require('./Customer')(sequelize, Sequelize.DataTypes);
const Company = require('./Company')(sequelize, Sequelize.DataTypes);
const Vehicle = require('./Vehicle')(sequelize, Sequelize.DataTypes);
const VehicleModel = require('./VehicleModel')(sequelize, Sequelize.DataTypes);
const Driver = require('./Driver')(sequelize, Sequelize.DataTypes);
const Booking = require('./Booking')(sequelize, Sequelize.DataTypes);
const Notification = require('./Notification')(sequelize, Sequelize.DataTypes);
const Payment = require('./Payment')(sequelize, Sequelize.DataTypes);
const TourPackage = require('./TourPackage')(sequelize, Sequelize.DataTypes);
const HotelBooking = require('./HotelBooking')(sequelize, Sequelize.DataTypes);
const FlightBooking = require('./FlightBooking')(sequelize, Sequelize.DataTypes);
const TourCampaign = require('./TourCampaign')(sequelize, Sequelize.DataTypes);
const TourGuide = require('./TourGuide')(sequelize, Sequelize.DataTypes);
const Promotion = require('./Promotion')(sequelize, Sequelize.DataTypes);
const Installment = require('./Installment')(sequelize, Sequelize.DataTypes);

// 🧩 علاقات المستأجر
Tenant.hasMany(User, { foreignKey: 'tenant_id' });
User.belongsTo(Tenant, { foreignKey: 'tenant_id' });

Tenant.hasMany(Customer, { foreignKey: 'tenant_id' });
Customer.belongsTo(Tenant, { foreignKey: 'tenant_id' });

Tenant.hasMany(Company, { foreignKey: 'tenant_id' });
Company.belongsTo(Tenant, { foreignKey: 'tenant_id' });

Tenant.hasMany(Vehicle, { foreignKey: 'tenant_id' });
Vehicle.belongsTo(Tenant, { foreignKey: 'tenant_id' });

Tenant.hasMany(Driver, { foreignKey: 'tenant_id' });
Driver.belongsTo(Tenant, { foreignKey: 'tenant_id' });

Tenant.hasMany(Booking, { foreignKey: 'tenant_id' });
Booking.belongsTo(Tenant, { foreignKey: 'tenant_id' });

Tenant.hasMany(Payment, { foreignKey: 'tenant_id' });
Payment.belongsTo(Tenant, { foreignKey: 'tenant_id' });

Tenant.hasMany(TourPackage, { foreignKey: 'tenant_id' });
TourPackage.belongsTo(Tenant, { foreignKey: 'tenant_id' });

Tenant.hasMany(TourCampaign, { foreignKey: 'tenant_id' });
TourCampaign.belongsTo(Tenant, { foreignKey: 'tenant_id' });

Tenant.hasMany(TourGuide, { foreignKey: 'tenant_id' });
TourGuide.belongsTo(Tenant, { foreignKey: 'tenant_id' });

Tenant.hasMany(Promotion, { foreignKey: 'tenant_id' });
Promotion.belongsTo(Tenant, { foreignKey: 'tenant_id' });

Tenant.hasMany(Installment, { foreignKey: 'tenant_id' });
Installment.belongsTo(Tenant, { foreignKey: 'tenant_id' });

// 🧩 علاقات الشركة
Company.hasMany(Customer, { foreignKey: 'company_id' });
Customer.belongsTo(Company, { foreignKey: 'company_id' });

Company.hasMany(Payment, { foreignKey: 'company_id' });
Payment.belongsTo(Company, { foreignKey: 'company_id' });

Company.hasMany(TourCampaign, { foreignKey: 'company_id' });
TourCampaign.belongsTo(Company, { foreignKey: 'company_id' });

// 🧩 علاقات العميل
Customer.hasMany(Booking, { foreignKey: 'customer_id' });
Booking.belongsTo(Customer, { foreignKey: 'customer_id' });

Customer.hasMany(Payment, { foreignKey: 'customer_id' });
Payment.belongsTo(Customer, { foreignKey: 'customer_id' });

Promotion.belongsToMany(Customer, { through: 'promotion_customers', foreignKey: 'promotion_id' });
Customer.belongsToMany(Promotion, { through: 'promotion_customers', foreignKey: 'customer_id' });

// 🧩 علاقات المركبة
VehicleModel.hasMany(Vehicle, { foreignKey: 'model_id' });
Vehicle.belongsTo(VehicleModel, { foreignKey: 'model_id' });

Vehicle.hasMany(Booking, { foreignKey: 'vehicle_id' });
Booking.belongsTo(Vehicle, { foreignKey: 'vehicle_id' });

// 🧩 علاقات السائق
Driver.hasMany(Booking, { foreignKey: 'driver_id' });
Booking.belongsTo(Driver, { foreignKey: 'driver_id' });

// 🧩 علاقات الحجز
Booking.hasMany(Notification, { foreignKey: 'booking_id' });
Notification.belongsTo(Booking, { foreignKey: 'booking_id' });

Booking.hasMany(Payment, { foreignKey: 'booking_id' });
Payment.belongsTo(Booking, { foreignKey: 'booking_id' });

Booking.hasMany(Installment, { foreignKey: 'booking_id' });
Installment.belongsTo(Booking, { foreignKey: 'booking_id' });

Booking.belongsTo(TourPackage, { foreignKey: 'tour_package_id' });
TourPackage.hasMany(Booking, { foreignKey: 'tour_package_id' });

Booking.belongsTo(TourCampaign, { foreignKey: 'tour_campaign_id' });
TourCampaign.hasMany(Booking, { foreignKey: 'tour_campaign_id' });

// 🧩 علاقات الباقات السياحية
TourPackage.hasMany(HotelBooking, { foreignKey: 'tour_package_id' });
HotelBooking.belongsTo(TourPackage, { foreignKey: 'tour_package_id' });

TourPackage.hasMany(FlightBooking, { foreignKey: 'tour_package_id' });
FlightBooking.belongsTo(TourPackage, { foreignKey: 'tour_package_id' });

Promotion.belongsToMany(TourPackage, { through: 'promotion_packages', foreignKey: 'promotion_id' });
TourPackage.belongsToMany(Promotion, { through: 'promotion_packages', foreignKey: 'package_id' });

// 🧩 علاقات الحجوزات الفندقية والطيران ضمن الحملات
TourCampaign.hasMany(HotelBooking, { foreignKey: 'tour_campaign_id' });
HotelBooking.belongsTo(TourCampaign, { foreignKey: 'tour_campaign_id' });

TourCampaign.hasMany(FlightBooking, { foreignKey: 'tour_campaign_id' });
FlightBooking.belongsTo(TourCampaign, { foreignKey: 'tour_campaign_id' });

// 🧩 علاقات المرشدين السياحيين بالحملات (جدول وسيط)
TourCampaign.belongsToMany(TourGuide, { through: 'campaign_guides', foreignKey: 'campaign_id' });
TourGuide.belongsToMany(TourCampaign, { through: 'campaign_guides', foreignKey: 'guide_id' });

// 🧩 علاقات الدفع بالأقساط
Payment.hasMany(Installment, { foreignKey: 'payment_id' });
Installment.belongsTo(Payment, { foreignKey: 'payment_id' });

Promotion.belongsToMany(Company, { through: 'promotion_companies', foreignKey: 'promotion_id' });
Company.belongsToMany(Promotion, { through: 'promotion_companies', foreignKey: 'company_id' });

// 📦 تصدير جميع النماذج
db.Tenant = Tenant;
db.User = User;
db.Customer = Customer;
db.Company = Company;
db.Vehicle = Vehicle;
db.VehicleModel = VehicleModel;
db.Driver = Driver;
db.Booking = Booking;
db.Notification = Notification;
db.Payment = Payment;
db.TourPackage = TourPackage;
db.HotelBooking = HotelBooking;
db.FlightBooking = FlightBooking;
db.TourCampaign = TourCampaign;
db.TourGuide = TourGuide;
db.Promotion = Promotion;
db.Installment = Installment;

// 🔌 دوال الاتصال وإنشاء الجداول
db.testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection has been established successfully.');
    return true;
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
    return false;
  }
};

db.initMigrations = async () => {
  try {
    await sequelize.sync({ alter: true }); // أو { force: true }
    console.log('✅ All models synchronized successfully.');
    return true;
  } catch (error) {
    console.error('❌ Failed to sync models:', error);
    return false;
  }
};

module.exports = db;
