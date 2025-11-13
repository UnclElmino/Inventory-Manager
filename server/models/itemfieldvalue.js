'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ItemFieldValue extends Model {
    static associate(models) {
      ItemFieldValue.belongsTo(models.Item, { as: 'item', foreignKey:'item_id' });
      ItemFieldValue.belongsTo(models.CustomField, { as: 'field', foreignKey: 'field_id' });
    }
  }
  ItemFieldValue.init({
    item_id: DataTypes.INTEGER,
    field_id: DataTypes.INTEGER,
    value_text: DataTypes.TEXT,
    value_number: DataTypes.DOUBLE,
    value_bool: DataTypes.BOOLEAN,
    value_link: DataTypes.TEXT
  }, { sequelize, modelName:'ItemFieldValue' });
  return ItemFieldValue;
};
