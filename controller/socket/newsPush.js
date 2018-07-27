const map =require('../../map');

module.exports = {
  newsPush,
  newsPushRoom
}

async function newsPush(event, userId, msg){
  try{
    map.userMapSocket[userId].emit(event, msg);
  }catch(err){
    console.error(err.message);
  }
}

async function newsPushRoom(session, event, roomId, msg){
  try{
    map.userMapSocket[session.user.id].to(roomId).emit(event, msg);
  }catch(err){
    console.error(err.message);
  }
}


