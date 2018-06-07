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

app.use(session({
  store : store,
  secret: 'about_oa',
  resave: false,
  cookie: {maxAge: 600000}//10 min
}));

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

/**
 * Create HTTP server.
 */

var server = require('http').Server(app);
var io     = require('socket.io')(server);

var adminNamespace = io.of('/admin');

// const handleIO = require('./socket');

const Redis = require('ioredis');
const redis = new Redis({
  port    : 6379,          // Redis port
  host    : 'redis',   // Redis host
  family  : 4,           // 4 (IPv4) or 6 (IPv6)
  password: 'admin',
  db      : 8
});

io.on('connection', async function handleConnection(socket) {
  // handle the connection and socket event in here
  console.log('a new connection:');
  console.log(socket.id);

  socket.on('login', async function (data) {
    // store in the `${user.id}-${user.name}-login`

    let id        = data.id;
    let name      = data.name;
    let sessionId = data.sessionId;
    console.log(`client emit login with data {id, name, sessionId}:${id}-${name}-${sessionId}`);
    let userList = await redis.lrange(`${id}-${name}-login`, 0, -1) || [];
    for (let i = 0; i < userList.length; i++) {
      let user = JSON.parse(userList[i]) || {};
      if (user['sessionId'] === sessionId) {
        console.log(`client emit login find the session `);
        user.socketId = socket.id;
        await redis.lset(`${id}-${name}-login`, i, JSON.stringify(user));
        break;
      }
    }
    console.log(`client emit login end !`);
    // here we can ltrim to limit login user!
    // just hold two login user!
    // await redis.ltrim(`${id}-${name}-login`, -2, -1);
  });

  socket.on('agreeLogin', async function (data) {
    // update in the `${user.id}-${user.name}-login`
    console.log('client emit agreeLogin with data {id, name, sessionId}');
    let id        = data.id;
    let name      = data.name;
    let sessionId = data.sessionId;
    let agree     = data.agree;
    let userList  = await redis.lrange(`${id}-${name}-login`, 0, -1) || [];
    for (let i = 0; i < userList.length; i++) {
      let user = JSON.parse(userList[i]) || {};
      if (user['sessionId'] === sessionId) {
        if (agree) {
          user.agree = true;
          await redis.lset(`${id}-${name}-login`, i, JSON.stringify(user));
          // tell the waiting user
          let userInfo = await redis.get(`${id}-${name}-userInfo`);
          io.sockets.connected[user.socketId].emit('agree', {agree: true, user: JSON.parse(userInfo) || {}});
        } else {
          await redis.lrem(`${id}-${name}-login`, 0, JSON.stringify(user));
          // delete the session
          store.destroy(user['sessionId'], function (err) {
            if (err) {
              console.log('agree login destroy session error');
              console.log(err);
            } else {
              console.log('agree login destroy session done');
            }
          });
          // tell the waiting user
          io.sockets.connected[user.socketId].emit('agree', {agree: false, user: {}});
        }
        break;
      }
    }
  });
});

app.use(function (req, res, next) {
  res.store          = store;
  res.io             = io;
  res.adminNamespace = adminNamespace;
  next();
});

app.use('/', indexRouter);
// app.use('/api/v1/', auth.checkFrequency, usersRouter);
app.use('/api/v1/', usersRouter);
app.use('/api/v1/', logsRouter);
app.use('/api/v1/', categoriesRouter);
app.use('/api/v1/', projectsRouter);

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
  db.sequelize.sync()
    .then(function () {
      modelAssociate();
      console.log('does it associate?');
    })
    .then(function () {
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

