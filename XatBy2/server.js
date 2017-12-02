let express = require('express'),
  app = express(),
  http = require('http').Server(app),
  io = require('socket.io')(http),
  ServerSocketManager = require('./serverSocketManager'),
  ServerCommandParser = require('./serverCommandParser');
  
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
  let serverCommandParser = new ServerCommandParser(socket, io);
  let serverSocketManager = new ServerSocketManager(socket, io, users, serverCommandParser);
});

http.listen(3000, function() {
  console.log('listening on *:3000');
});