'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Users', 'provider', { type: Sequelize.STRING });
    await queryInterface.addColumn('Users', 'provider_id', { type: Sequelize.STRING });
  },

  async down (queryInterface) {
    await queryInterface.removeColumn('Users', 'provider');
    await queryInterface.removeColumn('Users', 'provider_id');
  }
};
