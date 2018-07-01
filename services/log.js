const db        = require('../models');
const BBPromise = require('bluebird');

module.exports = {
  getLogs,
  insertLog
};

async function getLogs(options) {
  let whereLog = {};
  // search content
  if (options.search) {
    whereLog ['content'] = {
      [db.Sequelize.Op.like]: '%' + options.search + '%'
    };
  }

  // should we have a time zone to filter logs
  if (options.start && options.end) {
    whereLog['createTime'] = {
      [db.Sequelize.Op.and]: {
        [db.Sequelize.Op.gte]: options.start,
        [db.Sequelize.Op.lt] : options.end
      }
    };
  }
  // hard to handle the OP
  // if (options.start) {
  //   whereLog['createTime'][db.Sequelize.Op.gte] = options.start;
  // }
  // if (options.end) {
  //   whereLog['createTime'][db.Sequelize.Op.lt] = options.end;
  // }

  return await db.Log.findAndCountAll({
    where : whereLog,
    // attributes: ['id', 'userId', 'projectId', 'categoryId', 'type', 'content', 'createTime],
    raw   : true,
    offset: (options.pageIndex - 1) * options.pageSize,
    limit : options.pageSize,
    order : [["id", "ASC"]]
  });
}

async function insertLog(log) {

  switch (log.type) {
    case 1:
      // no create user log just break!
      break;
    case 2:
      // for update user ,just grant admin grant user
      logGrantUser(log);
      break;
    case 3:
      // for delete user
      logDeleteUser(log);
      break;
    case 11:
      // for create category
      logCreateCategory(log);
      break;
    case 12:
      // for update category
      logUpdateCategory(log);
      break;
    case 13:
      // for update category [order]
      logUpdateCategories(log);
      break;
    case 14:
      // for delete category
      logDeleteCategory(log);
      break;
    case 21:
      // for create project
      logCreateProject(log);
      break;
    case 22:
      // for update project
      logUpdateProject(log);
      break;
    case 23:
      // for update project order
      logUpdateProjects(log);
      break;
    case 24:
      // for delete project
      logDeleteProject(log);
      break;
    default:
    // do nothing for default
  }
}

async function logGrantUser(log) {
  let admin   = log.admin;
  let user    = log.user;
  let before  = log.user.permission === 90 ? 'admin' : 'user';
  let after   = log.options.permission === 90 ? 'admin' : 'user';
  let success = log.success ? '[success]' : '[fail]';
  let content = `Admin [${admin.name}] grant User [${user.name}] from [${before}] to [${after}] - ${success}`;
  let Log     = {
    userId    : admin.id,
    categoryId: 0,
    projectId : 0,
    type      : log.type,
    createTime: Date.now(),
    content   : content
  };
  return db.Log.create(Log);
}

async function logDeleteUser(log) {
  let admin   = log.admin;
  let user    = log.user;
  let isAdmin = log.user.permission === 90 ? 'Admin' : 'User';
  let success = log.success ? '[success]' : '[fail]';
  let content = `Admin [${admin.name}] delete ${isAdmin} [${user.name}] - ${success}`;
  let Log     = {
    userId    : admin.id,
    categoryId: 0,
    projectId : 0,
    type      : log.type,
    createTime: Date.now(),
    content   : content
  };
  return db.Log.create(Log);
}

async function logCreateCategory(log) {
  let admin    = log.admin;
  let category = log.category;
  let success  = log.success ? '[success]' : `[fail]-[${category.name}] already created`;
  let content  = `Admin [${admin.name}] create category [${category.name}] - ${success}`;
  let Log      = {
    userId    : admin.id,
    categoryId: category.id,
    projectId : 0,
    type      : log.type,
    createTime: Date.now(),
    content   : content
  };
  return db.Log.create(Log);
}

async function logUpdateCategory(log) {
  let admin    = log.admin;
  let category = log.category;
  let options  = log.options;
  let success  = log.success ? '[success]' : `[fail]-[${category.name}] not exits`;
  let diff     = '';
  for (let key in options) {
    if (options.hasOwnProperty(key) && category[key] !== options[key]) {
      diff += `[${key}] from [${category[key]}] to [${options[key]}] `;
    }
  }
  let content = `Admin [${admin.name}] update category [${category.name}] -[${diff}]- ${success}`;
  let Log     = {
    userId    : admin.id,
    categoryId: category.id,
    projectId : 0,
    type      : log.type,
    createTime: Date.now(),
    content   : content
  };
  return db.Log.create(Log);
}

async function logUpdateCategories(log) {
  let admin      = log.admin;
  let categories = log.categories || [];
  let success    = log.success ? '[success]' : `[fail]`;
  let diff       = '';
  for (let category of categories) {
    diff += `set order = [${category['order']}] where id = [${category['id']}]`;
  }
  let content = `Admin [${admin.name}] update category order -[${diff}]- ${success}`;
  let Log     = {
    userId    : admin.id,
    categoryId: 0,
    projectId : 0,
    type      : log.type,
    createTime: Date.now(),
    content   : content
  };
  return db.Log.create(Log);
}

async function logDeleteCategory(log) {
  let admin    = log.admin;
  let category = log.category || {};
  let projects = log.projects || [];
  let rmPro    = '';
  let success  = log.success ? '[success]' : `[fail]-[${category.name}] not exist`;
  for (let project of projects) {
    rmPro += `[${project.name}]`;
  }
  let content = `Admin [${admin.name}] delete category [${category.name}] - remove project -[${rmPro}] - ${success}`;
  let Log     = {
    userId    : admin.id,
    categoryId: 0,
    projectId : 0,
    type      : log.type,
    createTime: Date.now(),
    content   : content
  };
  return db.Log.create(Log);
}

async function logCreateProject(log) {
  let admin    = log.admin;
  let project  = log.project || {};
  let category = project.Category || {};
  let success  = log.success ? '[success]' : `[fail]-[${project.name}] already created`;
  let content  = `Admin [${admin.name}] create project [${project.name}] to category [${project.categoryId}][${category.name}]- ${success}`;
  let Log      = {
    userId    : admin.id,
    categoryId: project.categoryId,
    projectId : project.id,
    type      : log.type,
    createTime: Date.now(),
    content   : content
  };
  return db.Log.create(Log);
}

async function logUpdateProject(log) {
  let admin   = log.admin;
  let project = log.project;
  let options = log.options;
  let success = log.success ? '[success]' : `[fail]-[${project.name}] not exits`;
  let diff    = '';
  for (let key in options) {
    if (options.hasOwnProperty(key) && project[key] !== options[key]) {
      diff += `[${key}] from [${project[key]}] to [${options[key]}] `;
    }
  }
  let content = `Admin [${admin.name}] update project [${project.name}] -[${diff}]- ${success}`;
  let Log     = {
    userId    : admin.id,
    categoryId: 0,
    projectId : project.id,
    type      : log.type,
    createTime: Date.now(),
    content   : content
  };
  return db.Log.create(Log);
}

async function logUpdateProjects(log) {
  let admin    = log.admin;
  let projects = log.projects || [];
  let success  = log.success ? '[success]' : `[fail]`;
  let diff     = '';
  for (let project of projects) {
    diff += `set order = [${project['order']}] categoryId = [${project['categoryId']}] where id = [${project['id']}]`;
  }
  let content = `Admin [${admin.name}] update project order -[${diff}]- ${success}`;
  let Log     = {
    userId    : admin.id,
    categoryId: 0,
    projectId : 0,
    type      : log.type,
    createTime: Date.now(),
    content   : content
  };
  return db.Log.create(Log);
}

async function logDeleteProject(log) {
  let admin    = log.admin;
  let project  = log.project || {};
  let category = project.Category || {};
  let success  = log.success ? '[success]' : `[fail]-[${project.name}] not exist`;
  let content  = `Admin [${admin.name}] delete project [${project.name}] from category -[${project.categoryId}][${category.name}] - ${success}`;
  let Log      = {
    userId    : admin.id,
    categoryId: 0,
    projectId : project.id,
    type      : log.type,
    createTime: Date.now(),
    content   : content
  };
  return db.Log.create(Log);
}