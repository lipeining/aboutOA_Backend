const cateService = require('../../../services/category');

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
    let count = await cateService.delCate(category);
    if (count) {
      return res.json({code: 0});
    } else {
      return res.json({Message: {err: 'wrong id'}, code: 4});
    }
  } catch (err) {
    console.log(err);
    return res.json({Message: {err: err}, code: 4});
  }
}


