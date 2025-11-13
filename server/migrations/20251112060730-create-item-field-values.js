'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ItemFieldValues', {
      id: { allowNull:false, autoIncrement:true, primaryKey:true, type:Sequelize.INTEGER },
      item_id: {
        type:Sequelize.INTEGER, allowNull:false,
        references:{ model:'Items', key:'id' }, onDelete:'CASCADE'
      },
      field_id: {
        type:Sequelize.INTEGER, allowNull:false,
        references:{ model:'CustomFields', key:'id' }, onDelete:'CASCADE'
      },
      // store in type-appropriate columns; only one should be non-null
      value_text:   { type:Sequelize.TEXT, allowNull:true },
      value_number: { type:Sequelize.DOUBLE, allowNull:true },
      value_bool:   { type:Sequelize.BOOLEAN, allowNull:true },
      value_link:   { type:Sequelize.TEXT, allowNull:true },
      createdAt: { allowNull:false, type:Sequelize.DATE, defaultValue:Sequelize.fn('NOW') },
      updatedAt: { allowNull:false, type:Sequelize.DATE, defaultValue:Sequelize.fn('NOW') },
    });
    await queryInterface.addConstraint('ItemFieldValues', {
      fields:['item_id','field_id'], type:'unique', name:'item_field_unique'
    });
  },
  async down(queryInterface) { await queryInterface.dropTable('ItemFieldValues'); }
};