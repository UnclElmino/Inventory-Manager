'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('CustomFields', {
      id: { allowNull:false, autoIncrement:true, primaryKey:true, type:Sequelize.INTEGER },
      inventory_id: {
        type:Sequelize.INTEGER, allowNull:false,
        references:{ model:'Inventories', key:'id' }, onDelete:'CASCADE'
      },
      name: { type:Sequelize.STRING, allowNull:false },
      key:  { type:Sequelize.STRING, allowNull:false }, // slug-ish unique per inventory
      type: { type:Sequelize.ENUM('text','multiline','number','link','boolean'), allowNull:false },
      order_index: { type:Sequelize.INTEGER, allowNull:false, defaultValue:0 },
      createdAt: { allowNull:false, type:Sequelize.DATE, defaultValue:Sequelize.fn('NOW') },
      updatedAt: { allowNull:false, type:Sequelize.DATE, defaultValue:Sequelize.fn('NOW') },
    });
    await queryInterface.addConstraint('CustomFields', {
      fields:['inventory_id','key'], type:'unique', name:'customfields_inv_key_unique'
    });
  },
  async down(queryInterface) { await queryInterface.dropTable('CustomFields'); }
};
