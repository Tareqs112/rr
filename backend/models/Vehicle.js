module.exports = (sequelize, DataTypes) => {
  const Vehicle = sequelize.define('Vehicle', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    model_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'vehicle_models',
        key: 'id'
      }
    },
    license_plate: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    color: {
      type: DataTypes.STRING,
      allowNull: true
    },
    insurance_expiry: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    license_expiry: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('available', 'booked', 'maintenance'),
      allowNull: false,
      defaultValue: 'available'
    },
    rental_type: {
      type: DataTypes.ENUM('standard', 'with_driver'),
      allowNull: false,
      defaultValue: 'standard'
    },
    daily_rate: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    driver_daily_rate: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    tenant_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'tenants',
        key: 'id'
      },
      comment: 'For multi-tenant SaaS implementation'
    }
  }, {
    tableName: 'vehicles',
    timestamps: true
  });

  return Vehicle;
};
