module.exports = (sequelize, DataTypes) => {
  const Booking = sequelize.define('Booking', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    booking_id: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      defaultValue: () => `BK-${Math.floor(100000 + Math.random() * 900000)}`
    },
    customer_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'customers',
        key: 'id'
      }
    },
    vehicle_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'vehicles',
        key: 'id'
      }
    },
    driver_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'drivers',
        key: 'id'
      }
    },
    pickup_date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    pickup_time: {
      type: DataTypes.STRING,
      allowNull: false
    },
    return_date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    return_time: {
      type: DataTypes.STRING,
      allowNull: false
    },
    pickup_location: {
      type: DataTypes.STRING,
      allowNull: false
    },
    return_location: {
      type: DataTypes.STRING,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('confirmed', 'in_progress', 'completed', 'cancelled'),
      allowNull: false,
      defaultValue: 'confirmed'
    },
    payment_status: {
      type: DataTypes.ENUM('paid', 'pending', 'hold'),
      allowNull: false,
      defaultValue: 'pending'
    },
    payment_method: {
      type: DataTypes.ENUM('cash', 'credit_card', 'bank_transfer'),
      allowNull: true
    },
    total_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
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
    tableName: 'bookings',
    timestamps: true
  });

  return Booking;
};
