const db        = require('../models');
const BBPromise = require('bluebird');

module.exports = {
  getCategories,
  getCategory,
  createCate,
  updateCate,
  updateCategories,
  delCate,
};

async function getCategories(options) {
  let wherePro = {};
  // search name and intro
  if (options.search) {
    wherePro = {
      [db.Sequelize.Op.or]: [
        {
          name: {
            [db.Sequelize.Op.like]: '%' + options.search + '%'
          }
        },
        {
          intro: {
            [db.Sequelize.Op.like]: '%' + options.search + '%'
          }
        }
      ]
    };
  }
  return await db.Category.findAll({
    attributes: ['id', 'name', 'order', 'intro'],
    // required  : false,
    include   : [{
      model     : db.Project,
      where     : wherePro,
      raw       : true,
      attributes: ['id', 'name', 'order', 'intro', 'QRCode', 'url', 'hint', 'logo', 'categoryId', 'segment'],
      required  : false
    }],
    order     : [["order", "ASC"], [db.Project, "order", "ASC"]]
  });
  // User.findAll({ include:[ Player ], order:[[Player, 'id', DESC]]});
  // order:[[sequelize.col('player.playerLevel.level'), DESC]]

  // user.getChildren({
  //   limit: 10,
  //   order: [['name', 'ASC']]
  // }).then(function(children) {
  //   user.children = children;
  //   _.each(children, function(child) {
  //     child.getProfiles({
  //       limit: 3,
  //       order: [['id', 'DESC']]
  //     });
  //   });
  // });

  // return await db.Category.findAndCountAll({
  //   attributes: ['id', 'name', 'order', 'intro'],
  //   includes  : [{
  //     model: db.Project
  //   }],
  //   offset    : (options.pageIndex - 1) * options.pageSize,
  //   limit     : options.pageSize,
  //   order     : [["id", "ASC"]]
  // });
}

async function getCategory(options) {
  return await db.Category.findOne({
    where     : {id: options.id},
    attributes: ['id', 'name', 'order', 'intro'],
    include   : [{
      model   : db.Project,
      raw     : true,
      required: false
    }]
  });
}

async function createCate(newCate) {
  let max          = await db.Category.max('order') || 0;
  newCate['order'] = max + 1;
  let whereCate    = {name: newCate.name || ''};
  return await db.Category.findOrCreate({
    where     : whereCate,
    attributes: ['id', 'name', 'order', 'intro'],
    defaults  : newCate
  });
}

async function updateCate(category) {
  return db.Category.update(category, {
    where: {id: category.id},
  });
}

async function updateCategories(categories) {
  return db.sequelize.transaction(function (t) {
    // 在这里链接您的所有查询。 确保你返回他们。
    // take care of fields , make sure just update the order
    return BBPromise.each(categories, function (cate) {
      return db.Category.update(cate, {
        where      : {id: cate.id},
        fields     : ['order'],
        transaction: t
      });
    });
  }).then(function (result) {
    // 事务已被提交
    // result 是 promise 链返回到事务回调的结果
  }).catch(function (err) {
    // 事务已被回滚
    // err 是拒绝 promise 链返回到事务回调的错误
  });
}

async function delCate(cate) {
  return await db.Category.destroy({
    where: {id: cate.id}
  });
}
