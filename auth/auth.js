const redis = require('../redis');

module.exports = {
  checkAdmin,
  checkLogin,
  checkNotLogin,
  checkFrequency
};

function checkLogin(req, res, next) {
  if (!req.session.user) {
    return res.json({code: 3});
  }
  next();
}

function checkNotLogin(req, res, next) {
  if (req.session.user) {
    return res.json({code: 3});
  }
  next();
}

function checkAdmin(req, res, next) {
  if (req.session.user.permission !== 90) {
    return res.json({code: 5});
  }
  next();
}

async function checkFrequency(req, res, next) {
  // if the client request frequency is too high. just ignore the request
  let lastModifiedKey = `${req.ip}-last-modified`;
  let lastModified    = await redis.get(lastModifiedKey);
  lastModified        = parseInt(lastModified) || 0;
  let now             = Date.now();
  let interval        = now - lastModified; // millisecond
  console.log(`last-modified:${lastModified} - interval:${interval}`);
  // update the last modified set 60 second
  await redis.set(lastModifiedKey, now, 'EX', 60);
  if (interval < 1000 * 2) {
    return res.json({code: 5, Message: {err: 'to frequency'}});
  }
  next();
}
