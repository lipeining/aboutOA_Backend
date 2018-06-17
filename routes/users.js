var express    = require('express');
var router     = express.Router();
const auth     = require('../auth/auth');
const userCtrl = require('../controller/api/v1/user');

const {oneOf, check, checkSchema} = require('express-validator/check');

/* GET users listing. */
router.get('/users', auth.checkLogin, auth.checkAdmin,
  checkSchema({
    pageIndex: {
      in    : ['query'],
      toInt : true
    },
    pageSize : {
      in    : ['query'],
      toInt : true
    },
  }), userCtrl.getUsers);

/* GET users listing. */
// router.get('/makeUsers', auth.checkLogin, auth.checkAdmin, userCtrl.makeUsers);

/* GET user  */
router.get('/user', auth.checkLogin, auth.checkAdmin,
  checkSchema({
    id: {
      in    : ['query'],
      isInt : true,
      toInt : true
    }
  }), userCtrl.getUser);

// login
router.post('/login', auth.checkNotLogin,
  oneOf([
    checkSchema({
      phone   : {
        in    : ['body'],
        custom: {
          options: (value, {req, location, path}) => {
            return /^1[34578]\d{9}$/.test(value);
          }
        },
      },
      password: {
        in      : ['body'],
        isLength: {
          errorMessage: 'Password should be salt sha256',
          // Multiple options would be expressed as an array
          options     : {min: 64, max: 256}
        }
      }
    }),
    checkSchema({
      email   : {
        in     : ['body'],
        isEmail: true,
      },
      password: {
        in      : ['body'],
        isLength: {
          errorMessage: 'Password should be salt sha256',
          // Multiple options would be expressed as an array
          options     : {min: 64, max: 256}
        }
      }
    })
  ]), userCtrl.login);

// register
router.post('/reg', auth.checkNotLogin,
  oneOf([
    checkSchema({
      phone: {
        in    : ['body'],
        custom: {
          options: (value, {req, location, path}) => {
            return /^1[34578]\d{9}$/.test(value);
          }
        },
      }
    }),
    checkSchema({
      email: {
        in     : ['body'],
        isEmail: true,
      }
    })
  ]),
  checkSchema({
    name    : {
      in      : ['body'],
      isLength: {
        errorMessage: 'name should be in [5,16]',
        // Multiple options would be expressed as an array
        options     : {min: 5, max: 16}
      }
    },
    password: {
      in      : ['body'],
      isLength: {
        errorMessage: 'Password should be salt sha256',
        // Multiple options would be expressed as an array
        options     : {min: 64, max: 256}
      }
    }
    // intro: {
    //   in      : ['body'],
    //   isLength: {
    //     errorMessage: 'introduction should be in [5,16]',
    //     // Multiple options would be expressed as an array
    //     options     : {min: 20, max: 200}
    //   }
    // }
  }), userCtrl.reg);

// update
router.put('/user', auth.checkLogin,
  checkSchema({
    id   : {
      in   : ['body'],
      isInt: true,
      toInt: true
    },
    phone: {
      in    : ['body'],
      custom: {
        options: (value, {req, location, path}) => {
          return /^1[34578]\d{9}$/.test(value);
        }
      },
    },
    email: {
      in     : ['body'],
      isEmail: true,
    },
    name : {
      in      : ['body'],
      isLength: {
        errorMessage: 'name should be in [5,16]',
        // Multiple options would be expressed as an array
        options     : {min: 5, max: 16}
      }
    },
    intro: {
      in      : ['body'],
      isLength: {
        errorMessage: 'introduction should be in [20,120]',
        // Multiple options would be expressed as an array
        options     : {min: 20, max: 120}
      }
    }
  }), userCtrl.update);

// grant user
router.post('/grant', auth.checkLogin, auth.checkAdmin,
  checkSchema({
    id        : {
      in   : ['body'],
      isInt: true,
      toInt: true
    },
    permission: {
      in   : ['body'],
      isIn : ['0', '90'],
      isInt: true,
      toInt: true
    }
  }), userCtrl.grantUser);

// delete
router.delete('/user', auth.checkLogin, auth.checkAdmin,
  checkSchema({
    id: {
      in   : ['body'],
      isInt: true,
      toInt: true
    }
  }), userCtrl.delUser);

// logout
router.get('/logout', auth.checkLogin, userCtrl.logout);
// get captcha
router.get('/captcha', auth.checkNotLogin, userCtrl.getCaptcha);
router.delete('/captcha', auth.checkNotLogin, userCtrl.removeCaptcha);

module.exports = router;
