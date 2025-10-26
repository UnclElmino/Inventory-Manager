'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Items', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      inventory_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      custom_id: {
        type: Sequelize.STRING,
        allowNull: false
      },
      version: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1
      },
      created_by: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });
    await queryInterface.addConstraint('Items', {
      fields: ['inventory_id'], type: 'foreign key', references: { table: 'Inventories', field: 'id' },
      onDelete: 'CASCADE'
    });
    await queryInterface.addConstraint('Items', {
      type: 'unique', fields: ['inventory_id', 'custom_id'] // custom ID uniqueness per inventory
    });
    await queryInterface.addIndex('Items', ['inventory_id']);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Items');
  }
};