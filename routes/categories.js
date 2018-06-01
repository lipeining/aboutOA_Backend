var express    = require('express');
var router     = express.Router();
const auth     = require('../auth/auth');
const cateCtrl = require('../controller/api/v1/category');

// get Categories
// router.get('/categories', cateCtrl.getCategories);
router.get('/categories', auth.checkLogin, cateCtrl.getCategories);

// get Category names
router.get('/categorynames', auth.checkLogin, cateCtrl.getCategoryNames);

// get Category
router.get('/category', auth.checkLogin, cateCtrl.getCategory);

// create Category
router.post('/category', auth.checkLogin, auth.checkAdmin, cateCtrl.createCate);

// update Category
router.put('/category', auth.checkLogin, auth.checkAdmin, cateCtrl.updateCate);

// update Category order
router.put('/categoryOrder', auth.checkLogin, auth.checkAdmin, cateCtrl.updateCateOrder);

// update Categories orders
router.put('/categories', auth.checkLogin, auth.checkAdmin, cateCtrl.updateCategories);

// delete Category
router.delete('/category', auth.checkLogin, auth.checkAdmin, cateCtrl.delCate);

module.exports = router;