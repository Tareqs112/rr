module.exports = {
  JWT_SECRET: process.env.JWT_SECRET || 'car_rental_jwt_secret_key',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
  SALT_ROUNDS: 10
};
