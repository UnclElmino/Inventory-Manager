'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class DiscussionPost extends Model {
    static associate(models) {
      // who this post belongs to
      DiscussionPost.belongsTo(models.User, {
        foreignKey: 'user_id'
      });

      // which inventory this post is for
      DiscussionPost.belongsTo(models.Inventory, {
        foreignKey: 'inventory_id'
      });
    }
  }
  DiscussionPost.init({
    inventory_id: DataTypes.INTEGER,
    user_id: DataTypes.INTEGER,
    body_md: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'DiscussionPost',
  });
  return DiscussionPost;
};
