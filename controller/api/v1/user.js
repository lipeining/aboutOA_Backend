const userService = require('../../../services/user');

module.exports = {
  makeUsers,
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
  let options   = {
    pageIndex: pageIndex,
    pageSize : pageSize,
    search   : req.query.search || ''
  };
  try {
    let users = await userService.getUsers(options);
    return res.json({Message: {users: users}, code: 0});
  } catch (err) {
    console.log(err);
    return res.json({Message: {err: err}, code: 4});
  }
}

async function getUser(req, res, next) {
  let options = {
    id: parseInt(req.query.id) || 0
  };
  try {
    let user = userService.getUser(options);
    return res.json({Message: {user: user}, code: 0});
  } catch (err) {
    console.log(err);
    return res.json({Message: {err: err}, code: 4});
  }
}

async function login(req, res, next) {
  let options = {
    password: req.body.password || '',
    email   : req.body.email || '',
    phone   : parseInt(req.body.phone) || 0
  };
  try {
    let user = await userService.login(options);
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
  let newUser = {
    name      : req.body.name || '',
    password  : req.body.password || '',
    email     : req.body.email || '',
    phone     : parseInt(req.body.phone) || 0,
    permission: 0,
    intro     : req.body.intro || ''
  };
  try {
    let [user, created] = await userService.reg(newUser);
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

async function makeUsers(req, res, next) {
  // api/v1/makeUsers?code=112358wow&num=1000
  if (req.query.code !== '112358wow') {
    return res.json({Message: {err: 'err code'}, code: 4});
  } else {
    try {
      let num    = parseInt(req.query.num) || 500;
      let result = await userService.makeUsers(num);
      if (result) {
        return res.json({code: 0});
      } else {
        return res.json({code: 4});
      }
    } catch (err) {
      console.log(err);
      return res.json({Message: {err: err}, code: 4});
    }
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
    let count = await userService.update(user);
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
  let options = {
    id        : parseInt(req.body.id) || 0,
    permission: parseInt(req.body.permission) || 0
  };
  try {
    let count = await userService.grantUser(options);
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
    let count = await userService.delUser(user);
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
