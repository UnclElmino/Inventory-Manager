'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Inventory extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.User, { as: 'owner', foreignKey: 'owner_id' });

      this.hasMany(models.Item, { foreignKey: 'inventory_id' });
      this.hasMany(models.InventoryField, { foreignKey: 'inventory_id' });
      this.hasMany(models.DiscussionPost, { foreignKey: 'inventory_id' });
      this.hasMany(models.CustomField, { foreignKey:'inventory_id', as:'fields' });

      this.belongsToMany(models.Tag, { through: models.InventoryTag, foreignKey: 'inventory_id' });

      this.belongsToMany(models.User, {
        through: models.InventoryWriter,
        as: 'writers',
        foreignKey: 'inventory_id',
        otherKey: 'user_id'
      });
    }
  }
  Inventory.init({
    owner_id: DataTypes.INTEGER,
    title: DataTypes.STRING,
    description_md: DataTypes.TEXT,
    category: DataTypes.STRING,
    image_url: DataTypes.STRING,
    is_public: DataTypes.BOOLEAN,
    version: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Inventory',
  });
  return Inventory;
};