var s  = require('../app');
var io = s.io;

module.exports = {
  sendLog: sendLog
};

function sendLog(data) {
  console.log(io);
  console.log(data);
  // io.sockets.emit('newLog', data);
}

