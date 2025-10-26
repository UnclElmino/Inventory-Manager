'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ItemFieldValue extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.Item, { foreignKey: 'item_id' });
      this.belongsTo(models.InventoryField, { foreignKey: 'field_id' });
    }
  }
  ItemFieldValue.init({
    item_id: DataTypes.INTEGER,
    field_id: DataTypes.INTEGER,
    value: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'ItemFieldValue',
  });
  return ItemFieldValue;
};