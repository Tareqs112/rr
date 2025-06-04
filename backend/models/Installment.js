module.exports = (sequelize, DataTypes) => {
  const Installment = sequelize.define('Installment', {
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
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    due_date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('pending', 'paid', 'overdue'),
      defaultValue: 'pending'
    },
    payment_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'payments',
        key: 'id'
      }
    },
    reminder_sent: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
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
    tableName: 'installments',
    timestamps: true
  });

  return Installment;
};
