var express    = require('express');
var router     = express.Router();
const auth     = require('../auth/auth');
const cateCtrl = require('../controller/api/v1/category');

const {oneOf, check, checkSchema} = require('express-validator/check');

// get Categories
// router.get('/categories', cateCtrl.getCategories);
router.get('/categories', auth.checkLogin,
  checkSchema({
    pageIndex : {
      in   : ['query'],
      toInt: true
    },
    pageSize  : {
      in   : ['query'],
      toInt: true
    },
    getProject: {
      in   : ['query'],
      toInt: true
    }
  }), cateCtrl.getCategories);

// get Category names
router.get('/categorynames', auth.checkLogin, cateCtrl.getCategoryNames);

// get Category
router.get('/category', auth.checkLogin,
  checkSchema({
    categoryId: {
      in   : ['query'],
      isInt: true,
      toInt: true
    }
  }), cateCtrl.getCategory);

// create Category
router.post('/category', auth.checkLogin, auth.checkAdmin,
  checkSchema({
    name : {
      in      : ['body'],
      isLength: {
        errorMessage: 'name should be in [5,30]',
        // Multiple options would be expressed as an array
        options     : {min: 5, max: 30}
      }
    },
    intro: {
      in      : ['body'],
      isLength: {
        errorMessage: 'introduction should be in [10,120]',
        // Multiple options would be expressed as an array
        options     : {min: 10, max: 120}
      }
    }
  }), cateCtrl.createCate);

// update Category
router.put('/category', auth.checkLogin, auth.checkAdmin, cateCtrl.updateCate);

// update Category order
router.put('/categoryOrder', auth.checkLogin, auth.checkAdmin, cateCtrl.updateCateOrder);

// update Categories orders
router.put('/categories', auth.checkLogin, auth.checkAdmin, cateCtrl.updateCategories);

// delete Category
router.delete('/category', auth.checkLogin, auth.checkAdmin,
  checkSchema({
    id: {
      in   : ['body'],
      isInt: true,
      toInt: true
    }
  }), cateCtrl.delCate);

module.exports = router;