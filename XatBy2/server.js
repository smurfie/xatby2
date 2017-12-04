let express = require('express'),
  app = express(),
  http = require('http').Server(app),
  io = require('socket.io')(http),
  cookieParser = require('cookie-parser'),
  i18n = require("i18n"),
  ServerSocketManager = require('./serverSocketManager'),
  ServerCommandParser = require('./serverCommandParser');
  
// set the view engine to ejs
app.set('view engine', 'ejs');

// set the public folder
app.use(express.static('public'))

// set the i18n configuration
i18n.configure({
	locales: ['en', 'ca', 'es'],
	defaultLocale: 'en',
	queryParameter: 'lang',
  cookie: 'i18n',
  directory: __dirname + '/locales'
});

// use cookieParser to expose cookies to req.cookies
app.use(cookieParser());

// i18n init parses req for language headers, cookies, etc.
app.use(i18n.init);

// one page app
app.get('/', function(req, res) {
	res.setLocale(req.cookies.i18n);
  res.render('main', {'i18n': res});
});

// change default language
app.get('/en', function (req, res) {
  res.cookie('i18n', 'en');
  res.redirect('/');
});

app.get('/ca', function (req, res) {
	res.cookie('i18n', 'ca');
	res.redirect('/');
});

app.get('/es', function (req, res) {
	res.cookie('i18n', 'es');
	res.redirect('/');
});

let users = {};

io.on('connection', function(socket){
  let serverCommandParser = new ServerCommandParser(socket, io);
  let serverSocketManager = new ServerSocketManager(socket, io, users, serverCommandParser);
});

http.listen(3000, function() {
  console.log('listening on *:3000');
  
});