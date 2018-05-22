const cateService = require('../../../services/category');
const proService  = require('../../../services/project');
const fse         = require('fs-extra');
const path        = require('path');

module.exports = {
  getCategories,
  getCategory,
  createCate,
  updateCate,
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
      if (created) {
        return res.json({Message: {category: category}, code: 0});
      } else {
        return res.json({Message: {err: 'name already used'}, code: 4});
      }
    } catch (err) {
      console.log(err);
      return res.json({Message: {err: err}, code: 4});
    }
  }
}

async function updateCate(req, res, next) {
  let categories = JSON.parse(req.body.categories) || [];
  try {
    await cateService.updateCate(categories);
    return res.json({code: 0});
  } catch (err) {
    console.log(err);
    return res.json({Message: {err: err}, code: 4});
  }
}

async function delCate(req, res, next) {
  let category = {
    id: parseInt(req.body.id) || 0
  };
  try {
    // should delete the useless project logo and QR code
    let projects = await proService.getProjects({categoryId: category.id});
    let count    = await cateService.delCate(category);
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
      return res.json({code: 0});
    } else {
      return res.json({Message: {err: 'wrong id'}, code: 4});
    }
  } catch (err) {
    console.log(err);
    return res.json({Message: {err: err}, code: 4});
  }
}


