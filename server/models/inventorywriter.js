'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class InventoryWriter extends Model {
    static associate(models) {
      InventoryWriter.belongsTo(models.Inventory, { foreignKey: 'inventory_id' });
      InventoryWriter.belongsTo(models.User, { foreignKey: 'user_id' });
    }
  }
  InventoryWriter.init({
    inventory_id: DataTypes.INTEGER,
    user_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'InventoryWriter',
  });
  return InventoryWriter;
};
