let i18n = require("i18n");

module.exports = class ServerSocketManager {
  constructor(socket, io, users, serverCommandParser) {
    this._nick;
    this._socket = socket;
    this._io = io;
    this._users = users;
    this._serverCommandParser = serverCommandParser;
    
    this._iniSocket();
  }
  
  /* INITIALIZE SOCKET */
  _iniSocket() {
    console.log("New socket: " + this._socket.id);
    this._socket.emit('need login');
    
    /* ACCEPTED MESSAGES */
    this._socket.on('login', msg => this._login(msg));
    this._socket.on('disconnect', () => this._disconnect());
    this._socket.on('chat message', msg => this._chatMessage(msg));
    this._socket.on('chat image', msg => this._chatImage(msg));
  }
  
  /* SOCKET FUNCTIONS */
  // LOGIN
  _login(nick) {
  	let nickRegex = /^[a-zA-Z\-_]{4,15}$/;
  	if (typeof nick !== "string" || !nick.match(nickRegex)) {
  		this._socket.emit('login error', i18n.__('message.username.restriction'));
  	} else if (!this._users[nick]) {
      this._nick = nick;
      this._users[nick] = this._socket;
      
      //Connecting to the general room:
      this._socket.join('general');
      
      this._socket.emit('login success');
      this._io.to('general').emit('login message', {'nick':this._nick, 'users':Object.keys(this._users).sort()}); //TODO pass message

      console.log("User connected: " + this._nick + " :: " + this._socket.id);
    } else {
      this._socket.emit('login error', i18n.__('message.username.in.use', {user: nick}));
    }
  }
  
  // DISCONNECT
  _disconnect() {
  	console.log("User disconnected: " + this._nick + " :: " + this._socket.id);
  	
    if (this._nick) {
      delete this._users[this._nick];
      this._io.to('general').emit('disconnect message', {'nick':this._nick, 'users':Object.keys(this._users).sort()}); //TODO pass message
    }
  }
  
  // CHAT MESSAGE
  _chatMessage({message, nickColor}) {
    //Check the user is currently in the general room (logged)
    if (this._socket.rooms.general && typeof message === "string" && typeof nickColor === "string") {
      if (message.startsWith("/")) {
      	this._socket.emit('chat message', {message, nickColor, nick: this._nick});
        this._serverCommandParser.parse(message.substring(1));
      } else {
        this._io.to('general').emit('chat message', {message, nickColor, nick: this._nick});
      }
    }
  }
  
  // CHAT IMAGE
  _chatImage({image, nickColor}) {
    //Check the user is currently in the general room (logged)
    if (this._socket.rooms.general && typeof image === "string" && typeof nickColor === "string") {
      this._io.to('general').emit('chat image', {image, nickColor, nick: this._nick});
    }
  }
}