module.exports = (sequelize, DataTypes) => {
  const Tenant = sequelize.define('Tenant', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    domain: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true
    },
    subscription_plan: {
      type: DataTypes.ENUM('basic', 'standard', 'premium'),
      allowNull: false,
      defaultValue: 'standard'
    },
    subscription_status: {
      type: DataTypes.ENUM('active', 'trial', 'expired', 'cancelled'),
      allowNull: false,
      defaultValue: 'trial'
    },
    trial_ends_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    settings: {
      type: DataTypes.JSON,
      allowNull: true
    },
    contact_email: {
      type: DataTypes.STRING,
      allowNull: false
    },
    contact_phone: {
      type: DataTypes.STRING,
      allowNull: true
    },
    logo_url: {
      type: DataTypes.STRING,
      allowNull: true
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'tenants',
    timestamps: true
  });

  return Tenant;
};
