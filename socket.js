// export to the /bin/www
const Redis = require('ioredis');
const redis = new Redis({
  port    : 6379,          // Redis port
  host    : 'redis',   // Redis host
  family  : 4,           // 4 (IPv4) or 6 (IPv6)
  password: 'admin',
  db      : 8
});

module.exports = {
  // handleConnection
};

// function handleConnection(socket) {
//   // handle the connection and socket event in here
//   console.log('a new connection:');
//   console.log(socket.id);
//
//   socket.on('login', async function (data) {
//     // store in the `${user.id}-${user.name}-login`
//     console.log('client emit login with data {id, name, sessionId}');
//     let id        = data.id;
//     let name      = data.name;
//     let sessionId = data.sessionId;
//     let userList  = await redis.lrange(`${id}-${name}-login`, 0, -1) || [];
//     for (let i = 0; i < userList.length; i++) {
//       let user = JSON.parse(userList[i]) || {};
//       if (user['sessionId'] === sessionId) {
//         user.socketId = socket.id;
//         await redis.lset(`${id}-${name}-login`, i, JSON.stringify(user));
//         break;
//       }
//     }
//     // here we can ltrim to limit login user!
//     // just hold two login user!
//     // await redis.ltrim(`${id}-${name}-login`, -2, -1);
//   });
//
//   socket.on('agreeLogin', async function (data) {
//     // update in the `${user.id}-${user.name}-login`
//     console.log('client emit agreeLogin with data {id, name, sessionId}');
//     let id        = data.id;
//     let name      = data.name;
//     let sessionId = data.sessionId;
//     let userList  = await redis.lrange(`${id}-${name}-login`, 0, -1) || [];
//     for (let i = 0; i < userList.length; i++) {
//       let user = JSON.parse(userList[i]) || {};
//       if (user['sessionId'] === sessionId) {
//         user.agree = true;
//         await redis.lset(`${id}-${name}-login`, i, JSON.stringify(user));
//         io.sockets.connected[user.socketId].emit('agree', )
//         break;
//       }
//     }
//   });
// }


