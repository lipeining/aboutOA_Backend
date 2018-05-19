var express    = require('express');
var router     = express.Router();
const auth     = require('../auth/auth');
const userCtrl = require('../controller/api/v1/user');
const cateCtrl = require('../controller/api/v1/category');
const proCtrl  = require('../controller/api/v1/project');


// get Projects
router.get('/projects', auth.checkLogin, proCtrl.getProjects);

// get Project
router.get('/project', auth.checkLogin, proCtrl.getProject);

// create Project
router.post('/project', auth.checkLogin, auth.checkAdmin, proCtrl.createPro);

// update Project
router.put('/project', auth.checkLogin, auth.checkAdmin, proCtrl.updatePro);

// delete Project
router.delete('/project', auth.checkLogin, auth.checkAdmin, proCtrl.delPro);

module.exports = router;
