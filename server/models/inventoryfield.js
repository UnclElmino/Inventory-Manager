'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class InventoryField extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.Inventory, { foreignKey: 'inventory_id' });
      this.hasMany(models.ItemFieldValue, { foreignKey: 'field_id' });
    }

  }
  InventoryField.init({
    inventory_id: DataTypes.INTEGER,
    type: DataTypes.STRING,
    title: DataTypes.STRING,
    description: DataTypes.STRING,
    show_in_table: DataTypes.BOOLEAN,
    position: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'InventoryField',
  });
  return InventoryField;
};