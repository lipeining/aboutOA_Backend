const db        = require('../models');
const BBPromise = require('bluebird');

module.exports = {
  getProjects,
  getProject,
  createPro,
  updatePro,
  updateProjects,
  delPro,
};

async function getProjects(options) {
  let wherePro = {
    categoryId: options.categoryId
  };
  return await db.Project.findAll({
    where: wherePro,
    raw  : true,
    order: [["order", "ASC"]]
  });
}

async function getProject(options) {
  return await db.Project.findOne({
    where  : {id: options.id},
    include: [{
      model: db.Category
    }]
  });
}

async function createPro(newPro) {
  let max         = await db.Project.max('order', {
    where: {categoryId: newPro.categoryId}
  }) || 0;
  newPro['order'] = max + 1;
  let wherePro    = {name: newPro.name || ''};
  // try findCreateFind to get the new project's category, don't work
  return await db.Project.findCreateFind({
    where   : wherePro,
    raw     : true,
    include : [{
      model: db.Category,
      raw  : true
    }],
    defaults: newPro
  });
}

async function updateProjects(projects) {
  return db.sequelize.transaction(function (t) {
    // 在这里链接您的所有查询。 确保你返回他们。
    // take care of fields , make sure just update the order and categoryId
    return BBPromise.each(projects, function (project) {
      return db.Project.update(project, {
        where      : {id: project.id},
        fields     : ['order', 'categoryId'],
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

function updatePro(project) {
  return db.Project.update(project, {
    where: {id: project.id}
  });
}

async function delPro(project) {
  return await db.Project.destroy({
    where: {id: project.id}
  });
}
