module.exports = (sequelize, DataTypes) => {
  const HotelBooking = sequelize.define('HotelBooking', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    booking_id: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      defaultValue: () => `HB-${Math.floor(100000 + Math.random() * 900000)}`
    },
    customer_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'customers',
        key: 'id'
      }
    },
    hotel_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    hotel_location: {
      type: DataTypes.STRING,
      allowNull: false
    },
    room_type: {
      type: DataTypes.STRING,
      allowNull: false
    },
    check_in_date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    check_out_date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    number_of_guests: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    number_of_rooms: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
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
    tableName: 'hotel_bookings',
    timestamps: true
  });

  return HotelBooking;
};
