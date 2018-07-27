var createError  = require('http-errors');
var express      = require('express');
var path         = require('path');
var cookieParser = require('cookie-parser');
var logger       = require('morgan');
var session      = require('express-session')

const auth           = require('./auth/auth');
var indexRouter      = require('./routes/index');
var usersRouter      = require('./routes/users');
var logsRouter       = require('./routes/logs');
var categoriesRouter = require('./routes/categories');
var projectsRouter   = require('./routes/projects');

/**
 * Module dependencies.
 */

var debug = require('debug')('useroa:server');
const db  = require('./models');

var app = express();

var RedisStore = require('connect-redis')(session);
var store      = new RedisStore({
  port: 6379,          // Redis port
  host: 'redis',   // Redis host
  pass: 'admin',
  db  : 8
});
var sessionMiddleware = session({
  store : store,
  secret: 'about_oa',
  resave: false,
  saveUninitialized: false,
  cookie: {maxAge: 6000000}//100 min
  // cookie: {maxAge: 30000}//10 min test for session reschedule!
});

app.use(sessionMiddleware);

// app.use(session({
//   secret           : 'about_oa',
//   resave           : true,
//   saveUninitialized: true,
//   cookie           : {maxAge: 6000000}//100 min
// }));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
// app.set('views', path.join(__dirname, 'dist'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'dist')));

/**
 * Get port from environment and store in Express.
 */

var port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

// var socketIORouter = require("./handler/SocketIORouter");
// var padMessageHandler = require("./handler/PadMessageHandler");
// var hooks = require("ep_etherpad-lite/static/js/pluginfw/hooks");
// var webaccess = require("ep_etherpad-lite/node/hooks/express/webaccess");
/**
 * Create HTTP server.
 */
var util = require('util');
var async = require('async');
var DB = require('./db/DB2').init();
var server = require('http').Server(app);
var io     = require('socket.io')(server);

var sharedsession = require("express-socket.io-session");

/* Require an express session cookie to be present, and load the
 * session. See http://www.danielbaulig.de/socket-ioexpress for more
 * info */
// var cookieParserFn = cookieParser(webaccess.secret, {});
// io.use(function(socket, next) {
//   sessionMiddleware(socket.request, socket.request.res, next);
// });


// Share session with io sockets
 
io.use(sharedsession(sessionMiddleware));

io.use(function(socket, accept) {
  var data = socket.request;
  console.log(socket.handshake.session);
  accept(null, true);
});

//Initalize the Socket.IO Router
// socketIORouter.setSocketIO(io);
// socketIORouter.addComponent("pad", padMessageHandler);

const redis = require('./redis');
const map = require('./map');
const news = require('./controller/socket/newsPush');
io.on('connection', async function handleConnection(socket) {
  // handle the connection and socket event in here
  console.log('a new connection:');
  console.log(socket.id);
  // sessionInfo[socket.id] = {
  //   clientId: socket.id,
  //   baseRev:0
  // };
  let session = socket.handshake.session;
  if(session && session.user){
    map.userMapSocket[session.user.id]= socket;
    map.socketMapSession[socket.id] = session.id;
  }
  console.log(session);
  // log the userMapSocket and socketMapSession
  console.log('userMapSocket');
  console.log(map.userMapSocket);
  console.log('socketMapSession');
  console.log(map.socketMapSession);

  socket.on('news', function(data){
    let msg = {
      who: session.user.id,
      what: data,
      result: 'server has seen.'
    };
    news.newsPush('news', session.user.id, msg);
  });

  socket.on('message', function (data){
    console.log('on message');
    console.log(session);
    console.log(data);

    // socket.emit('message', JSON.stringify(data.data.text));
    if(data.type === 'COLLABROOM'){
      handleUserChange();
    }else if(data.type==="CLIENT_READY"){
      
    }else {

    }
  });
});

app.use(function (req, res, next) {
  res.store          = store;
  res.io             = io;
  next();
});

app.use('/', indexRouter);
app.get('/api/v1/kickuser', function(req, res, next) {
  // res.render('index', { title: 'Express' });
  let options = {
    userId: parseInt(req.query.userId)||0,
    status: parseInt(req.query.status)||0
  };
  let kickUserSocket = map.userMapSocket[options.userId]||{};
  let kickUserSessionID = map.socketMapSession[kickUserSocket.id] || '';
  console.log('req.session');
  console.log(req.session.user);
  res.store.get(kickUserSessionID, function(err, session){
    if(err){
      console.log('get kick user session error'+ err);
    }else{
      console.log('get kick uesr session success');
      session.user.state = options.status;
      console.log(session);
      // session.save();// 没有save function
      res.store.set(kickUserSessionID, session);
    }
  });
  kickUserSocket.emit('kickuser', {
    admin: req.session.user
  });
  map.userMapSocket[req.session.user.id].emit('kickoutuser', 'success');
  return res.json({code: 0, msg: 'success'});
  // res.render('index');
});
app.use('/api/v1/', usersRouter);
/*  kick user . */
// app.use('/api/v1/', usersRouter);
// app.use('/api/v1/', logsRouter);
// app.use('/api/v1/', categoriesRouter);
// app.use('/api/v1/', projectsRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error   = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 404);
  return res.json({code: 4, Message: {err: 'not found'}});
  // res.render('error');
});

function modelAssociate() {
  db.Category.hasMany(db.Project, {
    foreignKey: 'categoryId',
    sourceKey : 'id'
  });
  db.Project.belongsTo(db.Category, {
    foreignKey: 'categoryId',
    targetKey : 'id'
  });
}

/**
 * Listen on provided port, on all network interfaces.
 */
function start() {
  // console.log(DB);
  // async.waterfall([
  //   //initalize the database
  //   function (callback)
  //   {
  //     DB.init(callback);
  //   },
  // ]);
  db.sequelize.sync()
    .then(function () {
      modelAssociate();
      console.log('does it associate?');
    })
    .then(function () {
      // console.log(DB);
      // DB.then(function(db){
      //   db.get("pad:aaa", function(err, pad){
      //     console.log('in app setup :' + util.inspect(pad));
      //   });
      // });
      console.log('server start on localhost:' + port);
      server.listen(port);
      server.on('error', onError);
      server.on('listening', onListening);
    });
}

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}

if (require.main === module) {
  start();
} else {
  module.exports = {
    app: app,
    io : io
  };
}

