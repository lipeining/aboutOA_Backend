const userService  = require('../../../services/user');
const emailService = require('../../../services/email');
const logService   = require('../../../services/log');
const captcha      = require('trek-captcha');
const fse          = require('fs-extra');
const fs           = require('fs');
const path         = require('path');
const uuidv4       = require('uuid/v4');
// const redis     = require("redis");
// const BBPromise = require("bluebird");
// BBPromise.promisifyAll(redis.RedisClient.prototype);

// const ioService = require('../../../services/io');
const {validationResult} = require('express-validator/check');

const _     = require('lodash');
const redis = require('../../../redis');
// const Redis = require('ioredis');
// const redis = new Redis({
//   port    : 6379,          // Redis port
//   host    : 'redis',   // Redis host
//   family  : 4,           // 4 (IPv4) or 6 (IPv6)
//   password: 'admin',
//   db      : 8
// });

const Scheduler = require('redis-scheduler');
var scheduler   = new Scheduler({
  host    : 'redis',
  port    : 6379,
  password: 'admin',
  db      : 8
});

// define the session destroyed event handler to the scheduler!
async function sessionDestroyedHandler(err, key) {
  // we should lrem the item from ${id}-${name}-login list
  if (err) {
    console.error(err);
  } else {
    // keyword about ${id}:${name}:${sessionId}
    console.log('run callback for keyword: ', key);
    // split the id and name and sessionId!
    let [id, name, sessionId] = key.split(':');
    // check the sessionId ttl by

    let pttl = await redis.pttl(`sess:${sessionId}`);
    pttl     = parseInt(pttl) || -2;
    if (pttl > 60000) {
      // the pttl is millisecond! it would reschedule while pttl > 60000 1min
      // the session is not destroyed so reschedule
      // Change expire time to pttl ms
      scheduler.reschedule({key: key, expire: pttl}, function (err) {
        if (err) {
          console.error(err);
        } else {
          console.log(`the session is rescheduled to be run in ${pttl} ms`);
        }
      });
    } else {
      // the ttl is -2 or -1 , just lrem the item from the list!
      let userRedisList = await redis.lrange(`${id}-${name}-login`, 0, -1) || [];
      if (userRedisList.length !== 0) {
        // delete the session store user
        for (let i = 0; i < userRedisList.length; i++) {
          let userI = JSON.parse(userRedisList[i]) || {};
          if (userI.sessionId === sessionId) {
            console.log(userI);
            console.log(userI.agree);
            let rem = await redis.lrem(`${id}-${name}-login`, 0, JSON.stringify(userI));
            console.log(`session destroyed callback  find the user index in the list rem return count:${rem}`);
          }
        }
      }
      await redis.del(`${id}-${name}-userInfo`);
    }
    // can we get the key content? no we can't
    // redis.get(key)
    //   .then(function (session) {
    //     console.log('the session is destroyed:');
    //     console.log(session);
    //   })
    //   .catch(function (err) {
    //     console.log('the session is destroyed with error:');
    //     console.error(err);
    //   });

    // should not end the scheduler! which is used for another client!
    // Delete all handlers and close connection to Redis
    // scheduler.end();
  }
}

module.exports = {
  findPass,
  findPassVerify,
  resetPass,
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
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({Message: {err: errors.array()}, code: 4});
  }
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
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({Message: {err: errors.array()}, code: 4});
  }
  let options = {
    id: parseInt(req.query.id) || 0
  };
  try {
    let user = await userService.getUser(options);
    // just test for the session and redis !
    // let userRedisList = await redis.lrange(`${user.id}-${user.name}-login`, 0, -1) || [];
    // console.log(`userRedisList`);
    // console.log(userRedisList);
    // res.store.all(function (err, sessions) {
    //   console.log('in store all callback ');
    //   console.log(sessions);
    // });
    return res.json({Message: {user: user}, code: 0});
  } catch (err) {
    console.log(err);
    return res.json({Message: {err: err}, code: 4});
  }
}

async function findPass(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({Message: {err: errors.array()}, code: 4});
  }
  let options = {
    email: req.body.email || '',
    name : req.body.name || ''
  };
  try {
    // 1.ensure the user is exists
    // 2.generate a verify token in redis which would be kept only 10min
    // and send email to the email with the content!
    let user = await userService.getUser(options);
    if (user) {
      let token = uuidv4();
      await redis.set(token, JSON.stringify(user), 'EX', 600);//10 minute
      // let verify     = `http://aboutoa.com/resetpass?verify=${token}`;
      let verify     = `http://localhost:8080/resetpass?verify=${token}`;
      let content    = 'you are trying to reset your account(<' + user.name + '> in http://aboutoa.com ) \
      password through email. </br> please click the follow link to reset your password, please reset it in 10 minute\
       any question ,please concat us duoyi@henahoji.com.</br> \
      <a href=' + verify + '>reset password</a>';
      let previewUrl = await emailService.sendResetPassMail(options.email, content);
      console.log(`Preview URL:${previewUrl}`);
      return res.json({Message: {previewUrl: previewUrl}, code: 0});
    } else {
      return res.json({Message: {err: 'no such user with the email!'}, code: 4});
    }
  } catch (err) {
    console.log(err);
    return res.json({Message: {err: err}, code: 4});
  }
}

async function findPassVerify(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({Message: {err: errors.array()}, code: 4});
  }
  let options = {
    verify: req.body.verify || ''
  };
  try {
    // 1.get the verify token in redis
    // 2.return the user info!
    let user = await redis.get(options.verify);
    user     = JSON.parse(user) || {};
    if (user.id) {
      return res.json({Message: {id: user.id}, code: 0});
    } else {
      return res.json({Message: {err: 'the verify token is out of time'}, code: 4});
    }
  } catch (err) {
    console.log(err);
    return res.json({Message: {err: err}, code: 4});
  }
}

async function resetPass(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({Message: {err: errors.array()}, code: 4});
  }
  let options = {
    id      : parseInt(req.body.id) || 0,
    password: req.body.password || ''
  };
  let verify  = req.body.verify;
  try {
    // 1.ensure the user is exists and the token is right
    // 2.reset the password by update and clear the token !

    let user = await redis.get(verify);
    user     = JSON.parse(user) || {};
    if (user.id !== options.id) {
      // the user is not the reset password user
      // reject it!
      return res.json({Message: {err: 'the verify token is not right to the user'}, code: 4});
    } else {
      let cnt = await userService.update(options);
      if (cnt) {
        await redis.del(verify);
        return res.json({Message: {info: 'reset password success'}, code: 0});
      } else {
        return res.json({Message: {err: 'no such user with the email!'}, code: 4});
      }
    }
  } catch (err) {
    console.log(err);
    return res.json({Message: {err: err}, code: 4});
  }
}

async function login(req, res, next) {

  // let users = await redis.get("users");
  // console.log(users);
  // users = JSON.parse(users);
  // console.log(users);
  // if (_.isEmpty(users)) {
  //   users = await db.User.findAndCountAll({
  //     offset: (pageIndex - 1) * pageSize,
  //     limit : pageSize,
  //     order : [["id", "DESC"]]
  //   });
  //   await redis.set("users", JSON.stringify(users), "EX", "1800");
  // }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({Message: {err: errors.array()}, code: 4});
  }

  let options = {
    password: req.body.password || '',
    email   : req.body.email || '',
    phone   : parseInt(req.body.phone) || 0
  };
  // now just use phone to store count
  // if count is timestamps , check if passed
  // else if count is integer, check > 5?
  // else the user is able to try login
  // what we get is a string ,should parseInt
  let count       = await redis.get(`${options.phone}-cnt`);
  count           = parseInt(count) || 0;
  let captchaCode = req.body.code || '';
  let now         = Date.now();
  console.log(`count is ${count}`);
  if (count > now) {
    let time = ((count - now) / 1000 / 60 / 60).toFixed(3);
    return res.json({Message: {err: `the user has try more than 5 times, try after ${time} hours`}, code: 4});
  } else {
    // count should less than 5 .
    if (req.session.captchaToken && captchaCode === req.session.captchaToken) {
      try {
        let user = await userService.login(options);
        if (user) {
          // clear the count
          await redis.del(`${options.phone}-cnt`);
          req.session.user = user;
          // remove the old captcha
          fse.remove(req.session.captchaPath);
          req.session.captchaToken = null;
          req.session.captchaPath  = null;

          // await redis.set('keyword', JSON.stringify(user));
          // just schedule the req.session.id
          // set a keyword about ${id}:${name}:${sessionId}
          // and the keyword would be later than the sess:-${req.session.id}
          let keyword = `${user.id}:${user.name}:${req.session.id}`;
          scheduler.schedule({
            key    : keyword,
            // key    : `sess:${req.session.id}`,
            expire : 600000, // should be equal to express-session-cookie-maxAge!
            // expire : 30000, // should be equal to express-session-cookie-maxAge!
            handler: sessionDestroyedHandler
          }, function (err) {
            if (err) {
              console.error(err);
            } else {
              console.log('scheduled successfully!');
            }
          });
          // Add a handler for req.session.id
          // scheduler.addHandler({
          //   key    : `keyword`,
          //   // key    : `sess:${req.session.id}`,
          //   handler: async function (err, key) {
          //     console.log('run another callback:' + key);
          //     let session = await redis.get(key);
          //     console.log('add handler:');
          //     // get null
          //     console.log(session);
          //   }
          // });

          // about login in two place! use res.store and the method in callback
          // console.log(res.store);
          res.store.all(function (err, sessions) {
            console.log('in store all callback login');
            console.log(sessions);
          });
          // how to get the socketId, on the socket.io login event handleFunction
          let loginUser = {
            sessionId: req.session.id,
            time     : Date.now(),
            ip       : req.ip
            // socketId : socketId
            // socketId : ''
            // agree : false/true which need the login client to agree
          };

          let userRedisList = await redis.lrange(`${user.id}-${user.name}-login`, 0, -1) || [];
          console.log(`userRedisList`);
          console.log(userRedisList);
          if (userRedisList.length !== 0) {
            // send message to the login client
            for (let i = 0; i < userRedisList.length; i++) {
              let emitUser = JSON.parse(userRedisList[i]);
              // should we check the session?
              if (res.io.sockets.connected[emitUser['socketId']] && emitUser['agree']) {
                res.io.sockets.connected[emitUser['socketId']].emit('diffLogin', {
                  user: user, ip: req.ip, sessionId: req.session.id
                });
              }
            }
            // for the current user.just return need agree
            loginUser['agree'] = false;
            await redis.lpush(`${user.id}-${user.name}-login`, JSON.stringify(loginUser));
            await redis.set(`${user.id}-${user.name}-userInfo`, JSON.stringify(user), 'EX', 3600);
            // should we expire the list timeout?
            await redis.expire(`${user.id}-${user.name}-login`, 3600);
            return res.json({
              Message: {
                err: {
                  sessionId: req.session.id,
                  diffUser : {id: user.id, name: user.name}
                }
              }, code: 4
            });
          } else {
            loginUser['agree'] = true;
            await redis.lpush(`${user.id}-${user.name}-login`, JSON.stringify(loginUser));
            await redis.expire(`${user.id}-${user.name}-login`, 3600);
            await redis.set(`${user.id}-${user.name}-userInfo`, JSON.stringify(user), 'EX', 3600);
            return res.json({Message: {user: user, sessionId: req.session.id}, code: 0});
          }
        } else {
          // wrong password should count++ ,check if >= 5?

          count += 1;
          if (count > 10) {
            // count is timestamps reset it!
            count = 0;
          } else if (count >= 5) {
            // >=5  set 1 minute timeout
            // count = Date.now() + 3600 * 1000 * 2;
            count = Date.now() + 60 * 1000;
          } else {
            //do nothing
          }
          // set 2 hours 60*60*2*1000
          await redis.set(`${options.phone}-cnt`, count, 'EX', 60 * 60 * 2);
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
}

async function reg(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({Message: {err: errors.array()}, code: 4});
  }

  console.log(`request ip:${req.ip}`);
  console.log(`request ips:${req.ips}`);
  let ipReg    = `${req.ip}-reg`;
  let ipRegCnt = await redis.get(ipReg);
  ipRegCnt     = parseInt(ipRegCnt) || 0;
  console.log(`ip reg count:${ipRegCnt}`);
  if (ipRegCnt >= 3) {
    return res.json({code: 4, Message: {err: `to many register from ${req.ip}`}});
  } else {
    //
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
        // set timeout to be 8 hour?60*60*8
        // await redis.set(ipReg, ipRegCnt + 1, 'EX', 60 * 60 * 8);
        await redis.set(ipReg, ipRegCnt + 1, 'EX', 60);
        user.password      = '';
        req.session.user   = user;
        let loginUser      = {
          sessionId: req.session.id,
          time     : Date.now(),
          ip       : req.ip
          // socketId : socketId
          // socketId : ''
          // agree : false/true which need the login client to agree
        };
        loginUser['agree'] = true;
        await redis.lpush(`${user.id}-${user.name}-login`, JSON.stringify(loginUser));
        await redis.set(`${user.id}-${user.name}-userInfo`, JSON.stringify(user), 'EX', 3600);
        await redis.expire(`${user.id}-${user.name}-login`, 3600);
        return res.json({Message: {user: user}, code: 0});
      } else {
        return res.json({Message: {err: 'already created'}, code: 4});
      }
    } catch (err) {
      console.log(err);
      return res.json({Message: {err: err}, code: 4});
    }
  }
}

async function makeUsers(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({Message: {err: errors.array()}, code: 4});
  }

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
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({Message: {err: errors.array()}, code: 4});
  }

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
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({Message: {err: errors.array()}, code: 4});
  }

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
      let logContent = await logService.insertLog(log);
      // await ioService.sendLog(logContent);
      // console.log(res.adminNamespace);
      res.io.sockets.emit('newLog', logContent);
      // no broadcast method in namespace
      // res.adminNamespace.emit('adminLog', logContent);
      return res.json({code: 0});
    } else {
      log['success'] = 0;
      let logContent = await logService.insertLog(log);
      // await ioService.sendLog(logContent);
      res.io.sockets.emit('newLog', logContent);
      // res.adminNamespace.emit('adminLog', logContent);
      return res.json({Message: {err: 'wrong input'}, code: 4});
    }
  } catch (err) {
    console.log(err);
    return res.json({Message: {err: err}, code: 4});
  }
}

async function delUser(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({Message: {err: errors.array()}, code: 4});
  }

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
      let logContent = await logService.insertLog(log);
      // await ioService.sendLog(logContent);
      res.io.sockets.emit('newLog', logContent);
      return res.json({code: 0});
    } else {
      log['success'] = 0;
      let logContent = await logService.insertLog(log);
      // await ioService.sendLog(logContent);
      res.io.sockets.emit('newLog', logContent);
      return res.json({Message: {err: 'wrong id'}, code: 4});
    }
  } catch (err) {
    console.log(err);
    return res.json({Message: {err: err}, code: 4});
  }
}

async function logout(req, res, next) {
  let user          = req.session.user;
  let userRedisList = await redis.lrange(`${user.id}-${user.name}-login`, 0, -1) || [];
  if (userRedisList.length !== 0) {
    // delete the session store user
    for (let i = 0; i < userRedisList.length; i++) {
      let userI = JSON.parse(userRedisList[i]) || {};
      if (userI.sessionId === req.session.id) {
        console.log(userI);
        console.log(userI.agree);
        let rem = await redis.lrem(`${user.id}-${user.name}-login`, 0, JSON.stringify(userI));
        console.log(`logout find the user index in the list rem return count:${rem}`);
      }
    }
  }
  await redis.del(`${user.id}-${user.name}-userInfo`);
  req.session.destroy(function (err) {
    if (err) {
      console.log(err);
    } else {
      console.log('destroy session success');
    }
  });
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
    console.log(`token:${token}`);
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
