const db        = require('../models');
const BBPromise = require('bluebird');

module.exports = {
  getProjects,
  getProject,
  createPro,
  updatePro,
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
    where: {id: options.id},
    raw  : true
  });
}

async function createPro(newPro) {
  let wherePro = {name: newPro.name || ''};
  return await db.Project.findOrCreate({
    where   : wherePro,
    raw     : true,
    defaults: newPro
  });
}

async function updatePro(projects) {
  return db.sequelize.transaction(function (t) {
    // 在这里链接您的所有查询。 确保你返回他们。
    return BBPromise.each(projects, function (project) {
      return db.Project.update(project, {
        where      : {id: project.id},
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

async function delPro(project) {
  return await db.Project.destroy({
    where: {id: project.id}
  });
}
