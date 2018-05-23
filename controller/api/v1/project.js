const proService = require('../../../services/project');
const logService = require('../../../services/log');
const formidable = require('formidable');
const BBPromise  = require('bluebird');
const fs         = BBPromise.promisifyAll(require('fs'));
const path       = require('path');
const fse        = require('fs-extra');
const gm         = require('gm');

module.exports = {
  getProjects,
  getProject,
  createPro,
  updatePro,
  updateProjects,
  delPro,
  uploadImage,
  removeImage
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
    let project = await proService.getProject(options);
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
    QRCode    : req.body.QRCode || '',
    url       : req.body.url || '',
    hint      : req.body.hint || '',
    categoryId: parseInt(req.body.categoryId) || 0
  };
  try {
    let [project, created] = await proService.createPro(newPro);
    let log                = {
      admin  : req.session.user,
      project: project,
      type   : 21
    };
    if (created) {
      log['success'] = 1;
      logService.insertLog(log);
      return res.json({Message: {project: project}, code: 0});
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

// req.body.project
async function updatePro(req, res, next) {
  // handle the logo and QR code delete the unused !
  let options = JSON.parse(req.body.project) || {};
  try {
    let project = await proService.getProject(options);
    let log     = {
      admin  : req.session.user,
      project: project,
      options: options,
      type   : 22
    };
    let count   = await proService.updatePro(options);
    if (count) {
      // delete the old logo and QRCode
      console.log('remove old project  logo  and QRCode:');
      let allowExt = ['.jpeg', '.jpg', '.gif', '.png'];
      let rmLogo   = '';
      let rmQRCode = '';
      if (project.logo !== options.logo) {
        rmLogo = path.join(__dirname, '../../../public/', project.logo);
        if (allowExt.indexOf(path.extname(rmLogo)) !== -1) {
          await fse.remove(rmLogo);
        }
      }
      if (project.QRCode !== options.QRCode) {
        rmQRCode = path.join(__dirname, '../../../public/', project.QRCode);
        if (allowExt.indexOf(path.extname(rmQRCode)) !== -1) {
          await fse.remove(rmQRCode);
        }
      }
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

async function updateProjects(req, res, next) {
  // fix me validate the input only contain id,categoryId, order
  let projects = JSON.parse(req.body.projects) || [];
  try {
    await proService.updateProjects(projects);
    let log = {
      admin   : req.session.user,
      projects: projects,
      type    : 23,
      success : 1
    };
    logService.insertLog(log);
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
    // should delete the QRCode and logo if exists
    let delProject = await proService.getProject(project);
    let count      = await proService.delPro(project);
    let log        = {
      admin  : req.session.user,
      project: delProject,
      type   : 24
    };
    if (count) {
      console.log('remove project and logo QRCode:');
      let allowExt = ['.jpeg', '.jpg', '.gif', '.png'];
      let rmLogo   = '';
      let rmQRCode = '';
      if (delProject.logo) {
        rmLogo = path.join(__dirname, '../../../public/', delProject.logo);
        if (allowExt.indexOf(path.extname(rmLogo)) !== -1) {
          await fse.remove(rmLogo);
        }
      }
      if (delProject.QRCode) {
        rmQRCode = path.join(__dirname, '../../../public/', delProject.QRCode);
        if (allowExt.indexOf(path.extname(rmQRCode)) !== -1) {
          await fse.remove(rmQRCode);
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

async function uploadImage(req, res, next) {
  // let projects = JSON.parse(req.body.projects) || [];
  let form = new formidable.IncomingForm();

  form.parse(req, function (err, fields, files) {
    // 0:logo 1:QR code
    let type     = parseInt(fields.type) || 0;
    let file     = files.file;
    let today    = new Date();
    let filename = today.toISOString() + '-' + file.name;
    let newPath  = '';
    let url      = '';
    if (type) {
      newPath = path.resolve(__dirname, '../../../public/images/QRCode', filename);
      url     = path.join('/images/QRCode', filename);
    } else {
      newPath = path.resolve(__dirname, '../../../public/images/logo', filename);
      url     = path.join('/images/logo', filename);
    }
    console.log('oldPath:' + file.path);
    console.log('newPath:' + newPath);
    fse.move(file.path, newPath)
      .then(() => {
        // re draw picture here
        gm(newPath)
          .autoOrient()
          .write(newPath,
            function (err) {
              if (err) {
                console.log(err);
                return res.json({code: 4});
              } else {
                return res.json({code: 0, url: url});
              }
            });
      })
      .catch(err => {
        console.error(err);
        res.sendStatus(500);
        return res.json({code: 4, err: err});
      })
  });
}

async function removeImage(req, res, next) {
  let image = req.body.image || '';
  try {
    // because the image use the absolute path.
    let rmPath = path.join(__dirname, '../../../public/', image);
    console.log('remove:' + rmPath);
    // fs.unlinkSync(image);
    let allowExt = ['.jpeg', '.jpg', '.gif', '.png'];
    if (allowExt.indexOf(path.extname(rmPath)) !== -1) {
      await fse.remove(rmPath);
    }
    return res.json({code: 0});
  } catch (err) {
    console.log(err);
    return res.json({Message: {err: err}, code: 4});
  }
}
