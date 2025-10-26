'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.hasMany(models.Inventory, { foreignKey: 'owner_id' });

      this.belongsToMany(models.Inventory, {
        through: models.InventoryAccess,
        as: 'writableInventories',
        foreignKey: 'user_id',
        otherKey: 'inventory_id'
      });
    }
  }
  User.init({
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    avatar_url: DataTypes.STRING,
    is_admin: DataTypes.BOOLEAN,
    is_blocked: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};