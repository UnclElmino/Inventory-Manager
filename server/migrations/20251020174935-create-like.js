'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Likes', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      item_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      user_id: {
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
    await queryInterface.addConstraint('Likes', { fields: ['item_id'], type: 'foreign key', references: { table: 'Items', field: 'id' }, onDelete: 'CASCADE' });
    await queryInterface.addConstraint('Likes', { fields: ['user_id'], type: 'foreign key', references: { table: 'Users', field: 'id' }, onDelete: 'CASCADE' });
    await queryInterface.addConstraint('Likes', { type: 'unique', fields: ['item_id','user_id'] }); // one like per user per item

  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Likes');
  }
};