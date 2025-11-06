'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Items', 'quantity', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 1,
    });
  },
  async down(queryInterface) {
    await queryInterface.removeColumn('Items', 'quantity');
  }
};

