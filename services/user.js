const db     = require('../models');
const crypto = require('crypto');
const hmac   = crypto.createHmac('sha256', 'about oa');

module.exports = {
  makeUsers,
  getUsers,
  getUser,
  grantUser,
  login,
  reg,
  update,
  delUser
};

async function makeUsers(num) {
  let users = [];
  hmac.update('duoyi');
  let password = hmac.digest('hex');
  for (let i = 1; i <= num; i++) {
    let name    = 'duoyi' + i;
    let phone   = 18826077601 + i;
    let newUser = {
      name      : name,
      password  : password,
      email     : name + '@henhaoji.com',
      phone     : phone,
      permission: (phone % 2) ? 90 : 0,
      intro     : ''
    };
    users.push(newUser);
  }
  let resultUsers = await db.User.bulkCreate(users);
  return await resultUsers.length;
}

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












