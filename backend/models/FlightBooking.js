module.exports = (sequelize, DataTypes) => {
  const FlightBooking = sequelize.define('FlightBooking', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    booking_id: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      defaultValue: () => `FB-${Math.floor(100000 + Math.random() * 900000)}`
    },
    customer_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'customers',
        key: 'id'
      }
    },
    airline: {
      type: DataTypes.STRING,
      allowNull: false
    },
    flight_number: {
      type: DataTypes.STRING,
      allowNull: true
    },
    departure_city: {
      type: DataTypes.STRING,
      allowNull: false
    },
    arrival_city: {
      type: DataTypes.STRING,
      allowNull: false
    },
    departure_date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    departure_time: {
      type: DataTypes.STRING,
      allowNull: true
    },
    arrival_date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    arrival_time: {
      type: DataTypes.STRING,
      allowNull: true
    },
    passenger_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    ticket_class: {
      type: DataTypes.ENUM('economy', 'business', 'first'),
      allowNull: false,
      defaultValue: 'economy'
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
    booking_status: {
      type: DataTypes.ENUM('confirmed', 'pending', 'cancelled'),
      allowNull: false,
      defaultValue: 'confirmed'
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
    tableName: 'flight_bookings',
    timestamps: true
  });

  return FlightBooking;
};
