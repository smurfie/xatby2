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
  
  socket.on('disconnect', function(){
    if (nick) {
      delete users[nick];
      io.emit('disconnect message', {'nick':nick, 'users':Object.keys(users).sort()});
    }
  });
  
  socket.on('chat message', function(msg){
    msg.nick = nick;
    io.emit('chat message', msg);
  });
  
  socket.on('login', function(msg){
    if (!users[msg]) {
      nick = msg;
      users[msg] = socketId;
      socket.emit('login success');
      io.emit('login message', {'nick':nick, 'users':Object.keys(users).sort()});
    } else {
      socket.emit('login error', '"' + msg + '" is already in use');
    }
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});