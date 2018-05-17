var express    = require('express');
var router     = express.Router();
const db       = require('../models');
const _        = require('lodash');
const auth     = require('../auth/auth');
const userCtrl = require('../controller/api/v1/user');
const cateCtrl = require('../controller/api/v1/category');
const proCtrl  = require('../controller/api/v1/project');

/* GET users listing. */
router.get('/users', auth.checkLogin, auth.checkAdmin, userCtrl.getUsers);

/* GET users listing. */
router.get('/makeUsers', userCtrl.makeUsers);

/* GET user  */
router.get('/user', auth.checkLogin, auth.checkAdmin, userCtrl.getUser);

// login
router.post('/login', auth.checkNotLogin, userCtrl.login);

// register
router.post('/reg', auth.checkNotLogin, userCtrl.reg);

// update
router.put('/user', auth.checkLogin, userCtrl.update);

// grant user
router.post('/grant', auth.checkLogin, auth.checkAdmin, userCtrl.grantUser);

// delete
router.delete('/user', auth.checkLogin, auth.checkAdmin, userCtrl.delUser);

// logout
router.get('/logout', auth.checkLogin, userCtrl.logout);

// get Categories
router.get('/categories', auth.checkLogin, cateCtrl.getCategories);

// get Category
router.get('/category', auth.checkLogin, cateCtrl.getCategory);

// create Category
router.post('/category', auth.checkLogin, auth.checkAdmin, cateCtrl.createCate);

// update Category
router.put('/category', auth.checkLogin, auth.checkAdmin, cateCtrl.updateCate);

// delete Category
router.delete('/category', auth.checkLogin, auth.checkAdmin, cateCtrl.delCate);

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
