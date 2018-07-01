const logService = require('../../../services/log');

module.exports = {
  getLogs
};

async function getLogs(req, res, next) {
  let pageIndex = parseInt(req.query.pageIndex) || 1;
  let pageSize  = parseInt(req.query.pageSize) || 10;
  let options   = {
    pageIndex: pageIndex,
    pageSize : pageSize
  };

  options['search'] = req.query.search || '';
  // in default search  for one week logs?
  // should we get the exact 00:00:00 day?
  let today = new Date().toLocaleDateString();// string like 1970-01-01

  options['start'] = Date.parse(req.query.start) || (Date.parse(today)- 3600 * 1000 * 24 * 7);
  options['end']   = Date.parse(req.query.end || today) + 3600 * 1000 * 24;
  // make sure end is bigger than start !
  if (options['end'] <= options['start']) {
    return res.json({code: 4, Message: {err: 'end is smaller than start'}});
  } else {
    try {
      // console.log('start:' + options.start);
      // console.log('end:' + options.end);
      let logs = await logService.getLogs(options);
      return res.json({Message: {logs: logs}, code: 0});
    } catch (err) {
      console.log(err);
      return res.json({Message: {err: err}, code: 4});
    }
  }
}