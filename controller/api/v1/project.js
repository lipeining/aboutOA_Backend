const proService = require('../../../services/project');

module.exports = {
  getProjects,
  getProject,
  createPro,
  updatePro,
  delPro,
};

async function getProjects(req, res, next) {
  // let pageIndex = parseInt(req.query.pageIndex) || 1;
  // let pageSize  = parseInt(req.query.pageSize) || 10;
  // let options   = {
  //   pageIndex: pageIndex,
  //   pageSize : pageSize
  // };
  let options = {
    categoryId: parseInt(req.query.categoryId) || 0
  };
  try {
    let projects = await proService.getProjects(options);
    return res.json({Message: {projects: projects}, code: 0});
  } catch (err) {
    console.log(err);
    return res.json({Message: {err: err}, code: 4});
  }
}

async function getProject(req, res, next) {
  let options = {
    id: parseInt(req.query.id) || 0
  };
  try {
    let project = proService.getProject(options);
    return res.json({Message: {project: project}, code: 0});
  } catch (err) {
    console.log(err);
    return res.json({Message: {err: err}, code: 4});
  }
}

async function createPro(req, res, next) {
  let newPro = {
    name      : req.body.name || '',
    intro     : req.body.intro || '',
    logo      : req.body.logo || '',
    segment   : parseInt(req.body.segment) || 0,
    url       : req.body.url || '',
    hint      : req.body.hint || '',
    categoryId: parseInt(req.body.categoryId) || 0
  };
  try {
    let [project, created] = await proService.createPro(newPro);
    if (created) {
      return res.json({Message: {project: project}, code: 0});
    } else {
      return res.json({Message: {err: 'name already used'}, code: 4});
    }
  } catch (err) {
    console.log(err);
    return res.json({Message: {err: err}, code: 4});
  }

}

async function updatePro(req, res, next) {
  let projects = JSON.parse(req.body.projects) || [];
  try {
    await proService.updatePro(projects);
    return res.json({code: 0});
  } catch (err) {
    console.log(err);
    return res.json({Message: {err: err}, code: 4});
  }
}

async function delPro(req, res, next) {
  let project = {
    id: parseInt(req.body.id) || 0
  };
  try {
    let count = await proService.delPro(project);
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


