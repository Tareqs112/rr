module.exports = (sequelize, DataTypes) => {
  const Payment = sequelize.define('Payment', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    booking_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'bookings',
        key: 'id'
      }
    },
    customer_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'customers',
        key: 'id'
      }
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    payment_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    payment_method: {
      type: DataTypes.ENUM('cash', 'credit_card', 'bank_transfer'),
      allowNull: false
    },
    reference_number: {
      type: DataTypes.STRING,
      allowNull: true
    },
    voucher_number: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      defaultValue: () => `VCH-${Math.floor(100000 + Math.random() * 900000)}`
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('completed', 'pending', 'failed', 'refunded'),
      allowNull: false,
      defaultValue: 'completed'
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
    tableName: 'payments',
    timestamps: true
  });

  return Payment;
};
