'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('vehicle_models', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      manufacturer: {
        type: Sequelize.STRING,
        allowNull: false
      },
      year: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      category: {
        type: Sequelize.ENUM('economy', 'compact', 'midsize', 'luxury', 'suv', 'van'),
        allowNull: false
      },
      seats: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 5
      },
      transmission: {
        type: Sequelize.ENUM('automatic', 'manual'),
        allowNull: false,
        defaultValue: 'automatic'
      },
      fuel_type: {
        type: Sequelize.ENUM('petrol', 'diesel', 'hybrid', 'electric'),
        allowNull: false,
        defaultValue: 'petrol'
      },
      daily_rate: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      image_url: {
        type: Sequelize.STRING,
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
    await queryInterface.dropTable('vehicle_models');
  }
};
