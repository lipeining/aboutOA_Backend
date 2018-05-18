'use strict';
module.exports = (sequelize, DataTypes) => {
  const Project = sequelize.define('Project', {
    id        : {
      type         : DataTypes.INTEGER(11),
      field        : 'id',
      primaryKey   : true,
      autoIncrement: true,
      allowNull    : false,
      comment      : 'project id'
    },
    name      : {
      type        : DataTypes.STRING(256),
      field       : 'name',
      defaultValue: '',
      allowNull   : false,
      comment     : 'project name'
    },
    logo      : {
      type        : DataTypes.STRING(256),
      field       : 'logo',
      defaultValue: '',
      allowNull   : false,
      comment     : 'project logo'
    },
    segment   : {
      type        : DataTypes.STRING(256),
      field       : 'segment',
      defaultValue: '',
      allowNull   : false,
      comment     : 'project segment'
    },
    url       : {
      type        : DataTypes.STRING(256),
      field       : 'url',
      defaultValue: '',
      allowNull   : false,
      comment     : 'project url'
    },
    hint      : {
      type        : DataTypes.STRING(256),
      field       : 'hint',
      defaultValue: '',
      allowNull   : false,
      comment     : 'project hint'
    },
    categoryId: {
      type        : DataTypes.INTEGER(11),
      field       : 'category_id',
      defaultValue: 0,
      allowNull   : false,
      comment     : 'category id'
    },
    order: {
      type        : DataTypes.INTEGER(11),
      field       : 'order',
      defaultValue: 0,
      allowNull   : false,
      comment     : 'project order'
    },
    intro     : {
      type        : DataTypes.STRING(512),
      field       : 'intro',
      defaultValue: '',
      allowNull   : false,
      comment     : 'project introduction'
    }
  });

  Project.associate = function (models) {
    models.Project.belongsTo(models.Category, {
      foreignKey: 'categoryId',
      targetKey : 'id',
      onDelete  : 'CASCADE',
      onUpdate  : 'CASCADE'
    });
  };

  return Project;
};