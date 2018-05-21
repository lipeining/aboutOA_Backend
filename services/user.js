const db = require('../models');

module.exports = {
  getUsers,
  getUser,
  grantUser,
  login,
  reg,
  update,
  delUser
};

async function getUsers(options) {
  let whereUser = {};
  if (options.search) {
    whereUser.name = {
      [db.Sequelize.Op.like]: '%' + options.search + '%'
    };
  }
  return await db.User.findAndCountAll({
    where     : whereUser,
    attributes: ['id', 'name', 'email', 'phone', 'permission', 'intro'],
    offset    : (options.pageIndex - 1) * options.pageSize,
    limit     : options.pageSize,
    order     : [["id", "ASC"]]
  });
}

async function getUser(options) {
  return await db.User.findOne({
    where     : {id: options.id},
    attributes: ['id', 'name', 'email', 'phone', 'permission', 'intro']
  });
}

async function grantUser(user) {
  return await db.User.update(user, {
    where: {id: user.id}
  });
}

async function login(options) {
  let whereUser = {
    password: options.password || ''
  };
  if (options.email) {
    whereUser.email = options.email;
  } else if (options.phone) {
    whereUser.phone = options.phone || 0;
  }
  return await db.User.findOne({
    where     : whereUser,
    attributes: ['id', 'name', 'email', 'phone', 'permission', 'intro']
  });
}

async function reg(newUser) {
  let whereUser = {};
  if (newUser.email) {
    whereUser.email = newUser.email;
  } else if (newUser.phone) {
    whereUser.phone = newUser.phone || 0;
  }
  return await db.User.findOrCreate({
    where     : whereUser,
    attributes: ['id', 'name', 'email', 'phone', 'permission', 'intro'],
    defaults  : newUser
  });
}

async function update(user) {
  return await db.User.update(user, {
    where: {id: user.id}
  });
}

async function delUser(user) {
  return await db.User.destroy({
    where: {id: user.id}
  });
}












