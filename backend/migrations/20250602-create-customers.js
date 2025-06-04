'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('customers', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      full_name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      phone: {
        type: Sequelize.STRING,
        allowNull: false
      },
      nationality: {
        type: Sequelize.STRING,
        allowNull: true
      },
      whatsapp: {
        type: Sequelize.STRING,
        allowNull: true
      },
      company_name: {
        type: Sequelize.STRING,
        allowNull: true
      },
      is_vip: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      is_repeat_customer: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
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
    await queryInterface.dropTable('customers');
  }
};
