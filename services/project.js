const db        = require('../models');
const BBPromise = require('bluebird');

module.exports = {
  getProjects,
  getProject,
  getProjectNames,
  createPro,
  updatePro,
  updateProOrder,
  changeCategoryOrder,
  updateProjects,
  delPro,
};

async function getProjects(options) {
  let wherePro = {};
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
  wherePro['categoryId'] = options.categoryId;
  return await db.Project.findAndCountAll({
    where : wherePro,
    raw   : true,
    offset: (options.pageIndex - 1) * options.pageSize,
    limit : options.pageSize,
    order : [["order", "ASC"]]
  });
}

async function getProjectNames(options) {
  return await db.Project.findAll({
    where     : {categoryId: options.categoryId},
    attributes: ['id', 'order', 'name'],
    raw       : true,
    order     : [['order', 'ASC']]
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

async function updatePro(project) {
  return await db.Project.update(project, {
    where : {id: project.id},
    fields: ['name', 'intro', 'QRCode', 'url', 'hint', 'logo', 'segment']
  });
}

async function changeCategoryOrder(project, options) {
  let whereAffected = {
    categoryId: options.categoryId,
    order     : {
      [db.Sequelize.Op.gte]: options.order
    }
  };
  let plus          = 1;
  let affectedIds   = await db.Project.findAll({
    where     : whereAffected,
    raw       : true,
    attributes: ['id']
  })
    .map(function (project) {
      return project.id
    });
  return db.sequelize.transaction(function (t) {
    // 在这里链接您的所有查询。 确保你返回他们。
    // take care of fields , make sure just update the order
    // first , update the category and then update the affected rows
    return db.Project.update(options, {
      where      : {id: project.id},
      fields     : ['order', 'categoryId'],
      transaction: t
    })
      .then(function (result) {
        return db.Project.increment({
          order: plus
        }, {
          where      : {
            id: {
              [db.Sequelize.Op.in]: affectedIds
            }
          },
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

// update th project categoryId , order and affected projects
async function updateProOrder(project, options) {
  // get the affected rows
  let whereAffected = {
    categoryId: options.categoryId
  };
  let plus          = 1;
  if (project.order < options.order) {
    // low to high order
    whereAffected['order'] = {
      [db.Sequelize.Op.gt] : project.order,
      [db.Sequelize.Op.lte]: options.order
    };
    plus                   = -1;
  } else {
    // high to low order
    whereAffected['order'] = {
      [db.Sequelize.Op.gte]: options.order,
      [db.Sequelize.Op.lt] : project.order
    };
    plus                   = 1;
  }
  let affectedIds = await db.Project.findAll({
    where     : whereAffected,
    raw       : true,
    attributes: ['id']
  })
    .map(function (project) {
      return project.id
    });

  return db.sequelize.transaction(function (t) {
    // 在这里链接您的所有查询。 确保你返回他们。
    // take care of fields , make sure just update the order
    // first , update the category and then update the affected rows
    return db.Project.update(options, {
      where      : {id: project.id},
      fields     : ['order'],
      transaction: t
    })
      .then(function (result) {
        return db.Project.increment({
          order: plus
        }, {
          where      : {
            id: {
              [db.Sequelize.Op.in]: affectedIds
            }
          },
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
