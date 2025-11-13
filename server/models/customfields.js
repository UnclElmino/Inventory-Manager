'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class CustomField extends Model {
    static associate(models) {
      CustomField.belongsTo(models.Inventory, { foreignKey:'inventory_id' });
      CustomField.hasMany(models.ItemFieldValue, { foreignKey:'field_id', as:'values' });
    }
  }
  CustomField.init({
    inventory_id: DataTypes.INTEGER,
    name: DataTypes.STRING,
    key: DataTypes.STRING,
    type: DataTypes.ENUM('text','multiline','number','link','boolean'),
    order_index: DataTypes.INTEGER
  }, { sequelize, modelName:'CustomField' });
  return CustomField;
};
