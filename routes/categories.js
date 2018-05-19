var express    = require('express');
var router     = express.Router();
const auth     = require('../auth/auth');
const userCtrl = require('../controller/api/v1/user');
const cateCtrl = require('../controller/api/v1/category');
const proCtrl  = require('../controller/api/v1/project');

// get Categories
router.get('/categories', cateCtrl.getCategories);
// router.get('/categories', auth.checkLogin, cateCtrl.getCategories);

// get Category
router.get('/category', auth.checkLogin, cateCtrl.getCategory);

// create Category
router.post('/category', auth.checkLogin, auth.checkAdmin, cateCtrl.createCate);

// update Category
router.put('/category', auth.checkLogin, auth.checkAdmin, cateCtrl.updateCate);

// delete Category
router.delete('/category', auth.checkLogin, auth.checkAdmin, cateCtrl.delCate);

module.exports = router;