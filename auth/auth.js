module.exports = {
  checkAdmin,
  checkLogin,
  checkNotLogin
};

function checkLogin(req, res, next) {
  if (!req.session.user) {
    res.json({code: 3});
  }
  next();
}

function checkNotLogin(req, res, next) {
  if (req.session.user) {
    res.json({code: 3});
  }
  next();
}

function checkAdmin(req, res, next) {
  if (req.session.user.permission !== 90) {
    res.json({code: 3});
  }
  next();
}

