module.exports = (sequelize, DataTypes) => {
  const VehicleModel = sequelize.define('VehicleModel', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    manufacturer: {
      type: DataTypes.STRING,
      allowNull: false
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    category: {
      type: DataTypes.ENUM('economy', 'compact', 'midsize', 'luxury', 'suv', 'van'),
      allowNull: false
    },
    seats: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 5
    },
    transmission: {
      type: DataTypes.ENUM('automatic', 'manual'),
      allowNull: false,
      defaultValue: 'automatic'
    },
    fuel_type: {
      type: DataTypes.ENUM('petrol', 'diesel', 'hybrid', 'electric'),
      allowNull: false,
      defaultValue: 'petrol'
    },
    daily_rate: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    image_url: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'vehicle_models',
    timestamps: true
  });

  return VehicleModel;
};
