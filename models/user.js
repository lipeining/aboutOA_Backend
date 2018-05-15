'use strict';
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id        : {
      type         : DataTypes.INTEGER(11),
      field        : 'id',
      primaryKey   : true,
      autoIncrement: true,
      allowNull    : false,
      comment      : 'user id'
    },
    name      : {
      type        : DataTypes.STRING(256),
      field       : 'name',
      defaultValue: '',
      allowNull   : false,
      comment     : 'user name'
    },
    password  : {
      type        : DataTypes.STRING(256),
      field       : 'password',
      defaultValue: '',
      allowNull   : false,
      comment     : 'user password'
    },
    email     : {
      type        : DataTypes.STRING(256),
      field       : 'email',
      defaultValue: '',
      allowNull   : false,
      comment     : 'user email'
    },
    phone     : {
      type        : DataTypes.BIGINT(20),
      field       : 'phone',
      defaultValue: 0,
      allowNull   : false,
      comment     : 'user phone'
    },
    permission: {
      type        : DataTypes.INTEGER(11),
      field       : 'permission',
      defaultValue: 0,
      allowNull   : false,
      comment     : 'user permission'
    },
    intro     : {
      type        : DataTypes.STRING(512),
      field       : 'intro',
      defaultValue: '',
      allowNull   : false,
      comment     : 'user introduction'
    },

  });

  User.associate = function (models) {
    // models.User.hasMany(models.Task);
  };

  return User;
};