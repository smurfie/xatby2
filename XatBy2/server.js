let express = require('express'),
  app = express(),
  http = require('http').Server(app),
  io = require('socket.io')(http);

// set the view engine to ejs
app.set('view engine', 'ejs');

// set the public folder
app.use(express.static('public'))

// one page app
app.get('/', function(req, res){
  res.render('main');
});

let users = {};

io.on('connection', function(socket){
  let nick;
  
  console.log("New socket: " + socket.id);
  socket.emit('need login');
  
  //LOGIN - String (nick)
  socket.on('login', function(msg) {
  	let nickRegex = /^[a-zA-Z\-_]{4,15}$/;
  	if (!msg.match(nickRegex)) {
  		socket.emit('login error', 'Nickname has to be only letters, - or _, from 4 to 15 characters');
  	} else if (!users[msg]) {
      nick = msg;
      users[msg] = socket;
      
      //Connecting to the general room:
      socket.join('general');
      
      socket.emit('login success');
      io.to('general').emit('login message', {'nick':nick, 'users':Object.keys(users).sort()});

      console.log("User connected: " + nick + " :: " + socket.id);
    } else {
      socket.emit('login error', '"' + msg + '" is already in use');
    }
  });
  
  // DISCONNECT -
  socket.on('disconnect', function() {
  	console.log("User disconnected: " + nick + " :: " + socket.id);
  	
    if (nick) {
      delete users[nick];
      io.to('general').emit('disconnect message', {'nick':nick, 'users':Object.keys(users).sort()});
    }
  });
  
  // CHAT MESSAGE - String (message)
  socket.on('chat message', function(msg) {
    msg.nick = nick;
    io.to('general').emit('chat message', msg);
  });
  
  // CHAT IMAGE - String (Image Base64)
  socket.on('chat image', function(msg) {
    msg.nick = nick;
    io.to('general').emit('chat image', msg);
  });
});

http.listen(3000, function() {
  console.log('listening on *:3000');
});