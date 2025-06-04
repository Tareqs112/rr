module.exports = (sequelize, DataTypes) => {
  const Driver = sequelize.define('Driver', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false
    },
    license_number: {
      type: DataTypes.STRING,
      allowNull: false
    },
    license_expiry: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    languages: {
      type: DataTypes.STRING,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('available', 'off', 'booked'),
      allowNull: false,
      defaultValue: 'available'
    },
    daily_rate: {
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
    tableName: 'drivers',
    timestamps: true
  });

  return Driver;
};
