'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Add the 4 value columns if they don't exist yet
    await queryInterface.addColumn('ItemFieldValues', 'value_text', {
      type: Sequelize.TEXT,
      allowNull: true,
      after: 'field_id', // optional, just for ordering
    });

    await queryInterface.addColumn('ItemFieldValues', 'value_number', {
      type: Sequelize.DOUBLE,
      allowNull: true,
      after: 'value_text',
    });

    await queryInterface.addColumn('ItemFieldValues', 'value_bool', {
      type: Sequelize.BOOLEAN,
      allowNull: true,
      after: 'value_number',
    });

    await queryInterface.addColumn('ItemFieldValues', 'value_link', {
      type: Sequelize.TEXT,
      allowNull: true,
      after: 'value_bool',
    });
  },

  async down(queryInterface, Sequelize) {
    // Rollback: remove the columns
    await queryInterface.removeColumn('ItemFieldValues', 'value_text');
    await queryInterface.removeColumn('ItemFieldValues', 'value_number');
    await queryInterface.removeColumn('ItemFieldValues', 'value_bool');
    await queryInterface.removeColumn('ItemFieldValues', 'value_link');
  }
};
