"use strict";
let express = require('express'),
  app = express(),
  http = require('http').Server(app),
  io = require('socket.io')(http),
  cookieParser = require('cookie-parser'),
  bodyParser = require('body-parser');
  i18n = require("i18n"),
  ServerSocketManager = require('./serverSocketManager'),
  ServerCommandParser = require('./serverCommandParser'),
  Utils = require('./utils');
  
// set the view engine to ejs
app.set('view engine', 'ejs');

// set the public folder
app.use(express.static('public'));

// use cookieParser to expose cookies to req.cookies
app.use(cookieParser());

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

// set the i18n configuration
i18n.configure({
	defaultLocale: 'en',
  cookie: 'i18n',
  directory: __dirname + '/locales',
  updateFiles: false
});

console.log("Locales detected: " + i18n.getLocales());

// i18n init parses req for language headers, cookies, etc.
app.use(i18n.init);

// one page app
app.get('/', function(req, res) {
  if (req.cookies.i18n) {
    res.setLocale(req.cookies.i18n);
  } else {
    res.cookie('i18n','en');
    res.setLocale('en');
  }
  res.render('main', {'i18n': res});
});

// change default language
app.get('/:lang(en|es|ca)/', function (req, res) {
  res.cookie('i18n', req.params.lang);
  res.redirect('/');
});

// get translation (req.body.key / req.body.params(JSON.stringified))
app.post('/translate', function (req, res) {
  res.json(res.__(req.body.key, JSON.parse(req.body.params ? req.body.params : "{}")));
});


let users = {};

io.on('connection', function(socket){
  // set the lang(i18n) in the request
  i18n.init(socket.request);
  let i18nCookie = Utils.getCookie("i18n", socket.handshake.headers.cookie);
  socket.request.setLocale(i18nCookie ? i18nCookie : 'en');
    
  let serverCommandParser = new ServerCommandParser(socket, io);
  let serverSocketManager = new ServerSocketManager(socket, io, users, serverCommandParser);
});

http.listen(3000, function() {
  console.log('listening on *:3000');
});
