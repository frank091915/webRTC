const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const { v4: uuidV4} = require('uuid');

const app = express();
// this is a server to be used with Socket.io
const server = createServer(app);
// initializa socket.io and tell it which server we're actually using and it's going to interact with
const io = new Server(server);

app.set('view engine', 'ejs');
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.redirect(`${uuidV4()}`);
});

app.get('/:roomId', (req, res) => {
  res.render('room',{roomId:req.params.roomId})
});

// when the socket io connects, we add event listeners
io.on('connection', socket =>{
  // when users go to a room, this handler should be called with roomId and userId
  socket.on('join-room',(roomId, userId)=>{
    console.log('room joint', roomId);
    // subscribe the socket to a given channel
    socket.join(roomId)
    // simply use to when broadcasting or emitting
    // when we open another tab and go to the same room, then our existing room will recieve the userId
    socket.broadcast.to(roomId).emit('user-connected',userId);
  })
})

server.listen(3000, () => {
  console.log('server running at http://localhost:3000');
});

// peer.js allows us to connect differet users and gives us an ID of a user