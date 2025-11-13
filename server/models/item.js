'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Item extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.Inventory, { foreignKey: 'inventory_id' });
      this.hasMany(models.Like, { foreignKey: 'item_id' });
      this.hasMany(models.ItemFieldValue, { foreignKey:'item_id', as:'field_values' });
    }

  }
  Item.init({
    inventory_id: DataTypes.INTEGER,
    custom_id: DataTypes.STRING,
    version: DataTypes.INTEGER,
    created_by: DataTypes.INTEGER,
    quantity: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Item',
  });
  return Item;
};