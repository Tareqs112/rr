module.exports = (sequelize, DataTypes) => {
  const Promotion = sequelize.define('Promotion', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    discount_type: {
      type: DataTypes.ENUM('percentage', 'fixed_amount', 'free_service'),
      allowNull: false
    },
    discount_value: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    start_date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    end_date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    applicable_to: {
      type: DataTypes.ENUM('all', 'specific_customers', 'specific_companies'),
      defaultValue: 'all'
    },
    min_booking_value: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: 'Minimum booking value required to apply this promotion'
    },
    max_usage: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Maximum number of times this promotion can be used'
    },
    usage_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'Number of times this promotion has been used'
    },
    description: {
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
    tableName: 'promotions',
    timestamps: true
  });

  return Promotion;
};
