var express = require('express'),
  app = express(),
  http = require('http').Server(app),
  io = require('socket.io')(http);

var users = {};


// set the view engine to ejs
app.set('view engine', 'ejs');

// set the public folder
app.use(express.static('public'))

app.get('/', function(req, res){
  res.render('login');
});

app.post('/xat', function(req, res){
  res.render('xat');
});

io.on('connection', function(socket){
  var socketId = socket.id;
  var clientIp = socket.request.connection.remoteAddress;
  var nick;
  
  console.log("New socket: " + socketId);
  socket.emit('need login');
  
  socket.on('disconnect', function(){
  	console.log("User disconnected: " + nick + " :: " + socketId);
  	
    if (nick) {
      delete users[nick];
      io.to('general').emit('disconnect message', {'nick':nick, 'users':Object.keys(users).sort()});
    }
  });
  
  socket.on('chat message', function(msg){
    msg.nick = nick;
    io.to('general').emit('chat message', msg);
  });
  
  socket.on('login', function(msg){
  	var nickRegex = /^[a-zA-Z\-_]{4,15}$/;
  	if (!msg.match(nickRegex)) {
  		socket.emit('login error', 'Nickname has to be only letters, - or _, from 4 to 15 characters');
  	} else if (!users[msg]) {
      nick = msg;
      users[msg] = socketId;
      
      //Connecting to the general room:
      socket.join('general');
      
      socket.emit('login success');
      io.to('general').emit('login message', {'nick':nick, 'users':Object.keys(users).sort()});

      console.log("User connected: " + nick + " :: " + socketId);
    } else {
      socket.emit('login error', '"' + msg + '" is already in use');
    }
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});