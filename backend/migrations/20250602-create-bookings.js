'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('bookings', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      booking_id: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      customer_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'customers',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      vehicle_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'vehicles',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      driver_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'drivers',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      pickup_date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      pickup_time: {
        type: Sequelize.STRING,
        allowNull: false
      },
      return_date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      return_time: {
        type: Sequelize.STRING,
        allowNull: false
      },
      pickup_location: {
        type: Sequelize.STRING,
        allowNull: false
      },
      return_location: {
        type: Sequelize.STRING,
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('confirmed', 'in_progress', 'completed', 'cancelled'),
        allowNull: false,
        defaultValue: 'confirmed'
      },
      payment_status: {
        type: Sequelize.ENUM('paid', 'pending', 'hold'),
        allowNull: false,
        defaultValue: 'pending'
      },
      payment_method: {
        type: Sequelize.ENUM('cash', 'credit_card', 'bank_transfer'),
        allowNull: true
      },
      total_amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('bookings');
  }
};
