const db        = require('../models');
const BBPromise = require('bluebird');

module.exports = {
  getCategories,
  getCategory,
  createCate,
  updateCate,
  delCate,
};

async function getCategories(options) {
  return await db.Category.findAll({
    attributes: ['id', 'name', 'order', 'intro'],
    // required  : false,
    includes  : [{
      model     : db.Project,
      attributes: ['id', 'name', 'order', 'intro', 'url', 'hint', 'logo', 'categoryId', 'segment'],
      required  : false
      // raw  : true
    }],
    order     : [["order", "ASC"]]
  });

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
    includes  : [{
      model: db.Project
      // raw  : true
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

async function updateCate(categories) {
  return db.sequelize.transaction(function (t) {
    // 在这里链接您的所有查询。 确保你返回他们。
    return BBPromise.each(categories, function (cate) {
      return db.Category.update(cate, {
        where      : {id: cate.id},
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
