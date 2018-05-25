const userService = require('../../../services/user');
const logService  = require('../../../services/log');
const captcha     = require('trek-captcha');
const fse         = require('fs-extra');
const fs          = require('fs');
const path        = require('path');

module.exports = {
  makeUsers,
  getUsers,
  getUser,
  grantUser,
  login,
  reg,
  update,
  delUser,
  logout,
  getCaptcha,
  removeCaptcha
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
  let options     = {
    password: req.body.password || '',
    email   : req.body.email || '',
    phone   : parseInt(req.body.phone) || 0
  };
  let captchaCode = req.body.code || '';
  if (req.session.captchaToken && captchaCode === req.session.captchaToken) {
    try {
      let user = await userService.login(options);
      if (user) {
        req.session.user = user;
        // remove the old captcha
        fse.remove(req.session.captchaPath);
        req.session.captchaToken = null;
        req.session.captchaPath  = null;
        return res.json({Message: {user: user}, code: 0});
      } else {
        return res.json({Message: {err: 'wrong password'}, code: 4});
      }
    } catch (err) {
      console.log('login:' + err);
      return res.json({Message: {err: err}, code: 4});
    }
  } else {
    return res.json({Message: {err: 'wrong captcha code'}, code: 4});
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
    let user  = await userService.getUser(options);
    let count = await userService.grantUser(options);
    let log   = {
      admin  : req.session.user,
      user   : user,
      options: options,
      type   : 2
    };
    if (count) {
      log['success'] = 1;
      logService.insertLog(log);
      return res.json({code: 0});
    } else {
      log['success'] = 0;
      logService.insertLog(log);
      return res.json({Message: {err: 'wrong input'}, code: 4});
    }
  } catch (err) {
    console.log(err);
    return res.json({Message: {err: err}, code: 4});
  }
}

async function delUser(req, res, next) {
  let options = {
    id: parseInt(req.body.id) || 0
  };
  try {
    let user  = await userService.getUser(options);
    let log   = {
      admin: req.session.user,
      user : user,
      type : 3
    };
    let count = await userService.delUser(options);
    if (count) {
      log['success'] = 1;
      logService.insertLog(log);
      return res.json({code: 0});
    } else {
      log['success'] = 0;
      logService.insertLog(log);
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

async function getCaptcha(req, res, next) {
  try {
    // first generate a new captcha
    const {token, buffer} = await captcha();
    let filename          = `token-${Date.now()}.gif`;
    let url               = path.join('/images/captchas', filename);
    let filePath          = path.resolve(__dirname, '../../../public/images/captchas', filename);
    await fse.outputFile(filePath, buffer);
    // fs.writeFile(filepath, buffer);
    // fs.writeFile(filepath, buffer, {encoding: 'buffer'});
    // fs.createWriteStream(filepath).on('finish', () => console.log(token)).end(buffer);

    // second update the session captcha and token
    if (req.session.captchaToken && req.session.captchaPath) {
      // remove the old captcha
      await fse.remove(req.session.captchaPath);
    }
    req.session.captchaToken = token;
    req.session.captchaPath  = filePath;

    res.json({Message: {captcha: url}, code: 0});
  } catch (err) {
    res.json({code: 4, Message: {err: err}});
  }
}

// shall we remove the captcha ?
// if not , when the session timeout is end ,
// the req.session.captchaPath is gone , the picture would not be deleted!

async function removeCaptcha(req, res, next) {
  let url = req.body.url || '';
  try {
    let rmPath = path.join(__dirname, '../../../public/', url);
    console.log('remove captcha:' + rmPath);
    if (path.extname(rmPath) === '.gif') {
      await fse.remove(rmPath);
      req.session.captchaPath  = null;
      req.session.captchaToken = null;
      return res.json({code: 0});
    } else {
      res.json({Message: {err: 'not a gif '}, code: 4});
    }
  } catch (err) {
    console.log(err);
    return res.json({Message: {err: err}, code: 4});
  }
}
