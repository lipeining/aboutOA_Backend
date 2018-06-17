var express   = require('express');
var router    = express.Router();
const auth    = require('../auth/auth');
const proCtrl = require('../controller/api/v1/project');

const {oneOf, check, checkSchema} = require('express-validator/check');

// get Projects
router.get('/projects', auth.checkLogin,
  checkSchema({
    categoryId: {
      in   : ['query'],
      isInt: true,
      toInt: true
    }
  }), proCtrl.getProjects);

// get Project names
router.get('/projectnames', auth.checkLogin,
  checkSchema({
    categoryId: {
      in   : ['query'],
      isInt: true,
      toInt: true
    }
  }), proCtrl.getProjectNames);

// get Project
router.get('/project', auth.checkLogin,
  checkSchema({
    id: {
      in   : ['query'],
      isInt: true,
      toInt: true
    }
  }), proCtrl.getProject);

// create Project
router.post('/project', auth.checkLogin, auth.checkAdmin,
  oneOf([
    checkSchema({
      QRCode: {
        in    : ['body'],
        custom: {
          options: (value, {req, location, path}) => {
            return /^\/images\/QRCode\/\w+$/.test(value);
          }
        },
      }
    }),
    checkSchema({
      url: {
        in   : ['body'],
        isURL: true,
      }
    })
  ]),
  checkSchema({
    name      : {
      in      : ['body'],
      isLength: {
        errorMessage: 'name should be in [5,30]',
        // Multiple options would be expressed as an array
        options     : {min: 5, max: 30}
      }
    },
    intro     : {
      in      : ['body'],
      isLength: {
        errorMessage: 'introduction should be in [10,120]',
        // Multiple options would be expressed as an array
        options     : {min: 10, max: 120}
      }
    },
    hint      : {
      in      : ['body'],
      isLength: {
        errorMessage: 'introduction should be in [10,100]',
        // Multiple options would be expressed as an array
        options     : {min: 10, max: 100}
      }
    },
    categoryId: {
      in   : ['body'],
      isInt: true,
      toInt: true
    },
    segment   : {
      in   : ['body'],
      isIn : ['0', '1', '2', '3', '4', '5', '6', '7'],
      isInt: true,
      toInt: true
    }
  }), proCtrl.createPro);

// update Project
router.put('/project', auth.checkLogin, auth.checkAdmin,
  oneOf([
    checkSchema({
      QRCode: {
        in    : ['body'],
        custom: {
          options: (value, {req, location, path}) => {
            return /^\/images\/QRCode\/\w+$/.test(value);
          }
        },
      }
    }),
    checkSchema({
      url: {
        in   : ['body'],
        isURL: true,
      }
    })
  ]),
  checkSchema({
    name   : {
      in      : ['body'],
      isLength: {
        errorMessage: 'name should be in [5,30]',
        // Multiple options would be expressed as an array
        options     : {min: 5, max: 30}
      }
    },
    intro  : {
      in      : ['body'],
      isLength: {
        errorMessage: 'introduction should be in [10,120]',
        // Multiple options would be expressed as an array
        options     : {min: 10, max: 120}
      }
    },
    hint   : {
      in      : ['body'],
      isLength: {
        errorMessage: 'introduction should be in [10,100]',
        // Multiple options would be expressed as an array
        options     : {min: 10, max: 100}
      }
    },
    segment: {
      in   : ['body'],
      isIn : ['0', '1', '2', '3', '4', '5', '6', '7'],
      isInt: true,
      toInt: true
    }
  }), proCtrl.updatePro);

// update Projects
router.put('/projects', auth.checkLogin, auth.checkAdmin, proCtrl.updateProjects);

// delete Project
router.delete('/project', auth.checkLogin, auth.checkAdmin,
  checkSchema({
    id: {
      in   : ['body'],
      isInt: true,
      toInt: true
    }
  }), proCtrl.delPro);

// upload  Project image
router.post('/projectimage', auth.checkLogin, auth.checkAdmin, proCtrl.uploadImage);
// router.post('/projectimage', proCtrl.uploadImage);

// delete Project image
// router.delete('/projectimage', proCtrl.removeImage);
router.delete('/projectimage', auth.checkLogin, auth.checkAdmin, proCtrl.removeImage);

module.exports = router;
