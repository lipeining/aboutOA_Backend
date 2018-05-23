const cateService = require('../../../services/category');
const logService  = require('../../../services/log');
const fse         = require('fs-extra');
const path        = require('path');

module.exports = {
  getCategories,
  getCategory,
  createCate,
  updateCate,
  updateCategories,
  delCate,
};

async function getCategories(req, res, next) {
  // let pageIndex = parseInt(req.query.pageIndex) || 1;
  // let pageSize  = parseInt(req.query.pageSize) || 10;
  // let options   = {
  //   pageIndex: pageIndex,
  //   pageSize : pageSize
  // };
  let options = {};
  if (req.query.search) {
    options['search'] = req.query.search;
  }
  try {
    let categories = await cateService.getCategories(options);
    return res.json({Message: {categories: categories}, code: 0});
  } catch (err) {
    console.log(err);
    return res.json({Message: {err: err}, code: 4});
  }
}

async function getCategory(req, res, next) {
  let options = {
    id: parseInt(req.query.id) || 0
  };
  try {
    let category = cateService.getCategory(options);
    return res.json({Message: {category: category}, code: 0});
  } catch (err) {
    console.log(err);
    return res.json({Message: {err: err}, code: 4});
  }
}

async function createCate(req, res, next) {
  if (!req.body.name || !req.body.intro) {
    return res.json({code: 4, Message: {err: 'error input'}});
  } else {
    let newCate = {
      name : req.body.name || '',
      intro: req.body.intro || ''
    };
    try {
      let [category, created] = await cateService.createCate(newCate);
      let log                 = {
        admin   : req.session.user,
        category: category,
        type    : 11
      };
      if (created) {
        log['success'] = 1;
        logService.insertLog(log);
        return res.json({Message: {category: category}, code: 0});
      } else {
        log['success'] = 0;
        logService.insertLog(log);
        return res.json({Message: {err: 'name already used'}, code: 4});
      }
    } catch (err) {
      console.log(err);
      return res.json({Message: {err: err}, code: 4});
    }
  }
}

async function updateCate(req, res, next) {
  let options = JSON.parse(req.body.category) || {};
  try {
    let category = await cateService.getCategory(options);
    let count    = await cateService.updateCate(options);
    let log      = {
      admin   : req.session.user,
      category: category,
      options : options,
      type    : 12
    };
    if (count) {
      log['success'] = 1;
      logService.insertLog(log);
      return res.json({code: 0});
    } else {
      log['success'] = 0;
      logService.insertLog(log);
      return res.json({Message: {err: 'wrong input'}, code: 4});
    }
  } catch (err) {
    console.log(err);
    return res.json({Message: {err: err}, code: 4});
  }
}

async function updateCategories(req, res, next) {
  let categories = JSON.parse(req.body.categories) || [];
  try {
    await cateService.updateCategories(categories);
    let log = {
      admin     : req.session.user,
      categories: categories,
      type      : 13,
      success   : 1
    };
    logService.insertLog(log);
    return res.json({code: 0});
  } catch (err) {
    console.log(err);
    return res.json({Message: {err: err}, code: 4});
  }
}

async function delCate(req, res, next) {
  let options = {
    id: parseInt(req.body.id) || 0
  };
  try {
    // should delete the useless project logo and QR code

    let category = await cateService.getCategory(options);
    // let projects = await proService.getProjects({categoryId: options.id});
    let projects = category.Projects;
    let count    = await cateService.delCate(options);
    let log      = {
      admin   : req.session.user,
      category: category,
      projects: projects,
      type    : 14
    };
    if (count) {
      for (let project of projects) {
        let rmLogo   = '';
        let rmQRCode = '';
        let allowExt = ['.jpeg', '.jpg', '.gif', '.png'];
        if (project.logo) {
          rmLogo = path.join(__dirname, '../../../public/', project.logo);
          if (allowExt.indexOf(path.extname(rmLogo)) !== -1) {
            await fse.remove(rmLogo);
          }
        }
        if (project.QRCode) {
          rmQRCode = path.join(__dirname, '../../../public/', project.QRCode);
          if (allowExt.indexOf(path.extname(rmQRCode)) !== -1) {
            await fse.remove(rmQRCode);
          }
        }
      }
      log['success'] = 1;
      logService.insertLog(log);
      return res.json({code: 0});
    } else {
      log['success'] = 0;
      logService.insertLog(log);
      return res.json({Message: {err: 'wrong id'}, code: 4});
    }
  } catch (err) {
    console.log(err);
    return res.json({Message: {err: err}, code: 4});
  }
}


