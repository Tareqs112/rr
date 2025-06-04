module.exports = (sequelize, DataTypes) => {
  const TourPackage = sequelize.define('TourPackage', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    booking_id: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      defaultValue: () => `TP-${Math.floor(100000 + Math.random() * 900000)}`
    },
    customer_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'customers',
        key: 'id'
      }
    },
    package_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    start_date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    end_date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    number_of_persons: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    includes_hotel: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    includes_transport: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    includes_flight: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    total_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    cost_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    profit_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    payment_status: {
      type: DataTypes.ENUM('paid', 'pending', 'hold'),
      allowNull: false,
      defaultValue: 'pending'
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    company_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'companies',
        key: 'id'
      }
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
    tableName: 'tour_packages',
    timestamps: true
  });

  return TourPackage;
};
