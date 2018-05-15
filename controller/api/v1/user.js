const db = require('../../../models');

module.exports = {
  getUsers,
  getUser,
  grantUser,
  login,
  reg,
  update,
  delUser,
  logout
};

async function getUsers(req, res, next) {
  let pageIndex = parseInt(req.query.pageIndex) || 1;
  let pageSize  = parseInt(req.query.pageSize) || 10;
  try {
    let users = await db.User.findAndCountAll({
      attributes: ['id', 'name', 'email', 'phone', 'permission', 'intro'],
      offset    : (pageIndex - 1) * pageSize,
      limit     : pageSize,
      order     : [["id", "ASC"]]
    });
    return res.json({Message: {users: users}, code: 0});
  } catch (err) {
    console.log(err);
    return res.json({Message: {err: err}, code: 4});
  }
}

async function getUser(req, res, next) {
  let id = parseInt(req.query.id) || 0;
  try {
    let user = await db.User.findOne({
      where     : {id: id},
      attributes: ['id', 'name', 'email', 'phone', 'permission', 'intro']
    });
    return res.json({Message: {user: user}, code: 0});
  } catch (err) {
    console.log(err);
    return res.json({Message: {err: err}, code: 4});
  }
}

async function login(req, res, next) {
  let whereUser = {
    password: req.body.password || ''
  };
  if (req.body.email) {
    whereUser.email = req.body.email;
  } else if (req.body.phone) {
    whereUser.phone = parseInt(req.body.phone) || 0;
  }
  try {
    let user = await db.User.findOne({
      where     : whereUser,
      attributes: ['id', 'name', 'email', 'phone', 'permission', 'intro']
    });
    if (user) {
      req.session.user = user;
      return res.json({Message: {user: user}, code: 0});
    } else {
      return res.json({Message: {err: 'wrong password'}, code: 4});
    }
  } catch (err) {
    console.log('login:' + err);
    return res.json({Message: {err: err}, code: 4});
  }
}

async function reg(req, res, next) {
  let newUser   = {
    name      : req.body.name || '',
    password  : req.body.password || '',
    email     : req.body.email || '',
    phone     : parseInt(req.body.phone) || 0,
    permission: 0,
    intro     : req.body.intro || ''
  };
  let whereUser = {};
  if (req.body.email) {
    whereUser.email = req.body.email;
  } else if (req.body.phone) {
    whereUser.phone = parseInt(req.body.phone) || 0;
  }
  try {
    let [user, created] = await db.User.findOrCreate({
      where     : whereUser,
      attributes: ['id', 'name', 'email', 'phone', 'permission', 'intro'],
      defaults  : newUser
    });
    if (created) {
      user.password    = '';
      req.session.user = user;
      return res.json({Message: {user: user}, code: 0});
    } else {
      return res.json({Message: {err: 'already created'}, code: 4});
    }
  } catch (err) {
    console.log(err);
    return res.json({Message: {err: err}, code: 4});
  }
}

async function update(req, res, next) {
  let user = {
    id   : parseInt(req.body.id) || 0,
    phone: parseInt(req.body.phone) || 0,
    name : req.body.name || '',
    email: req.body.email || '',
    intro: req.body.intro || ''
  };
  try {
    let count = await db.User.update(user, {
      where: {id: user.id}
    });
    console.log('count is:' + count);
    if (count) {
      return res.json({code: 0, Message: {}});
    } else {
      return res.json({Message: {err: 'wrong input'}, code: 4});
    }
  } catch (err) {
    console.log(err);
    return res.json({Message: {err: err}, code: 4});
  }
}

async function grantUser(req, res, next) {
  let user = {
    id        : parseInt(req.body.id) || 0,
    permission: parseInt(req.body.permission) || 0
  };
  try {
    let count = await db.User.update(user, {
      where: {id: user.id}
    });
    if (count) {
      return res.json({code: 0});
    } else {
      return res.json({Message: {err: 'wrong input'}, code: 4});
    }
  } catch (err) {
    console.log(err);
    return res.json({Message: {err: err}, code: 4});
  }
}

async function delUser(req, res, next) {
  let user = {
    id: parseInt(req.body.id) || 0
  };
  try {
    let count = await db.User.destroy({
      where: {id: user.id}
    });
    if (count) {
      return res.json({code: 0});
    } else {
      return res.json({Message: {err: 'wrong id'}, code: 4});
    }
  } catch (err) {
    console.log(err);
    return res.json({Message: {err: err}, code: 4});
  }
}

async function logout(req, res, next) {
  req.session.user = null;
  return res.json({code: 0});
}
