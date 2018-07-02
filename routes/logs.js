var express   = require('express');
var router    = express.Router();
const auth    = require('../auth/auth');
const logCtrl = require('../controller/api/v1/log');

const {oneOf, check, checkSchema} = require('express-validator/check');

// get logs
// router.get('/logs', logCtrl.getlogs);
router.get('/logs', auth.checkLogin, auth.checkAdmin,
  checkSchema({
    pageIndex: {
      in   : ['query'],
      toInt: true
    },
    pageSize : {
      in   : ['query'],
      toInt: true
    },
  }), logCtrl.getLogs);
// router.get('/logs', logCtrl.getLogs);

module.exports = router;
