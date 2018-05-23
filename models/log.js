'use strict';
module.exports = (sequelize, DataTypes) => {
  const Log = sequelize.define('Log', {
      id        : {
        type         : DataTypes.INTEGER(11),
        field        : 'id',
        primaryKey   : true,
        autoIncrement: true,
        allowNull    : false,
        comment      : 'Log id'
      },
      userId    : {
        type        : DataTypes.INTEGER(11),
        field       : 'user_id',
        defaultValue: 0,
        allowNull   : false,
        comment     : 'user id'
      },
      projectId : {
        type        : DataTypes.INTEGER(11),
        field       : 'project_id',
        defaultValue: 0,
        allowNull   : false,
        comment     : 'project id'
      },
      categoryId: {
        type        : DataTypes.INTEGER(11),
        field       : 'category_id',
        defaultValue: 0,
        allowNull   : false,
        comment     : 'category id'
      },
      type      : {
        type        : DataTypes.INTEGER(11),
        field       : 'type',
        defaultValue: 0,
        allowNull   : false,
        comment     : 'log type [1-3]-[4-6]-[7-9] [create update delete] [user category project]'
      },
      // type [1-3]-[4-6]-[7-9] [create update delete] [user category project]
      content   : {
        type        : DataTypes.STRING(512),
        field       : 'content',
        defaultValue: '',
        allowNull   : false,
        comment     : 'Log content'
      },
      createTime: {
        type        : DataTypes.BIGINT(20),
        field       : 'create_time',
        defaultValue: 0,
        allowNull   : false,
        comment     : 'Log create time'
      }
    }, {
      timestamps: false,
      // // 不删除数据库条目，但将新添加的属性deletedAt设置为当前日期（删除完成时）。
      // // paranoid 只有在启用时间戳时才能工作
      // paranoid: true,
      //
      // // 不使用驼峰样式自动添加属性，而是下划线样式，因此updatedAt将变为updated_at
      // underscored: true,
      //
      // // 禁用修改表名; 默认情况下，sequelize将自动将所有传递的
      // // 模型名称（define的第一个参数）转换为复数。 如果你不想这样，请设置以下内容
      // freezeTableName: true,
      //
      // // 定义表的名称
      // tableName: 'table_log',
      //
      // // 启用乐观锁定。 启用时，sequelize将向模型添加版本计数属性，
      // // 并在保存过时的实例时引发OptimisticLockingError错误。
      // // 设置为true或具有要用于启用的属性名称的字符串。
      // version: true
    }
  );

  // no need to set foreign key !
  Log.associate = function (models) {
  };

  return Log;
};