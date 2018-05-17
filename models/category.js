'use strict';
module.exports = (sequelize, DataTypes) => {
  const Category = sequelize.define('Category', {
    id   : {
      type         : DataTypes.INTEGER(11),
      field        : 'id',
      primaryKey   : true,
      autoIncrement: true,
      allowNull    : false,
      comment      : 'category id'
    },
    name : {
      type        : DataTypes.STRING(256),
      field       : 'name',
      defaultValue: '',
      allowNull   : false,
      comment     : 'category name'
    },
    order: {
      type        : DataTypes.INTEGER(11),
      field       : 'order',
      defaultValue: 0,
      allowNull   : false,
      comment     : 'category order'
    },
    intro: {
      type        : DataTypes.STRING(512),
      field       : 'intro',
      defaultValue: '',
      allowNull   : false,
      comment     : 'category introduction'
    }
  });

  Category.associate = function (models) {
    models.Category.hasMany(models.Project, {
      foreignKey: 'categoryId', sourceKey: 'id'
    });
  };

  return Category;
};