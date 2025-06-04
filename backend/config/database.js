require('dotenv').config();
module.exports = {
  database: process.env.DB_NAME || 'car_rental_db',
  username: process.env.DB_USER || 'car_rental_user',
  password: process.env.DB_PASSWORD || 'password',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  dialect: process.env.DB_DIALECT || 'mysql', // تغيير من sqlite إلى mysql كقيمة افتراضية
  logging: false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  dialectOptions: {
    // خيارات إضافية لـ MySQL لدعم طرق المصادقة المختلفة
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci',
    supportBigNumbers: true,
    bigNumberStrings: true
  }
};
