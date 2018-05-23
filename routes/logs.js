var express   = require('express');
var router    = express.Router();
const auth    = require('../auth/auth');
const logCtrl = require('../controller/api/v1/log');

// get logs
// router.get('/logs', logCtrl.getlogs);
// router.get('/logs', auth.checkLogin, auth.checkAdmin, logCtrl.getLogs);
router.get('/logs', logCtrl.getLogs);

module.exports = router;