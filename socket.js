// export to the /bin/www

module.exports = {
  handleConnection
};

function handleConnection(socket) {
  // handle the connection and socket event in here
  console.log('a new connection:');
  console.log(socket.id);
}



