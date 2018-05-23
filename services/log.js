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

  return await db.Log.create(log);
}

