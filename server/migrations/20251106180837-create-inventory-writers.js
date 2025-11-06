// server/migrations/XXXXXXXXXXXXXX-create-inventory-writers.js
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('InventoryWriters', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      inventory_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Inventories', key: 'id' },
        onDelete: 'CASCADE'
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Users', key: 'id' },
        onDelete: 'CASCADE'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW')
      }
    });

    // unique pair
    await queryInterface.addConstraint('InventoryWriters', {
      fields: ['inventory_id', 'user_id'],
      type: 'unique',
      name: 'inventory_writers_unique'
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('InventoryWriters');
  }
};
