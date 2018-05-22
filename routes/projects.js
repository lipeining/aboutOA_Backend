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

// update Projects
router.put('/projects', auth.checkLogin, auth.checkAdmin, proCtrl.updateProjects);

// delete Project
router.delete('/project', auth.checkLogin, auth.checkAdmin, proCtrl.delPro);

// upload  Project image
router.post('/projectimage', auth.checkLogin, auth.checkAdmin, proCtrl.uploadImage);
// router.post('/projectimage', proCtrl.uploadImage);

// delete Project image
// router.delete('/projectimage', proCtrl.removeImage);
router.delete('/projectimage', auth.checkLogin, auth.checkAdmin, proCtrl.removeImage);

module.exports = router;
