'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('vehicles', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      model_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'vehicle_models',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      license_plate: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      color: {
        type: Sequelize.STRING,
        allowNull: true
      },
      vin: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true
      },
      status: {
        type: Sequelize.ENUM('available', 'booked', 'maintenance'),
        allowNull: false,
        defaultValue: 'available'
      },
      mileage: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      insurance_expiry: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      license_expiry: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      last_maintenance: {
        type: Sequelize.DATEONLY,
        allowNull: true
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
    await queryInterface.dropTable('vehicles');
  }
};
