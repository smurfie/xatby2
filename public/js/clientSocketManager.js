import * as Utils from './utils.js';

export default class ClientSocketManager {
  constructor() {
    this._socket = io();
    this._windowFocus = true;
    this._nick;
    this._users = {};
    
    this._iniSocket();
  }
  
  _iniSocket() {
    /* ACCEPTED MESSAGES */
    this._socket.on('connect', () => this._connect());
    this._socket.on('disconnect', () => this._disconnect());
    this._socket.on('chat message', msg => this._chatMessage(msg));
    this._socket.on('chat image', msg => this._chatImage(msg));
    this._socket.on('command message', msg => this._commandMessage(msg));
    this._socket.on('login message', msg => this._loginMessage(msg));
    this._socket.on('disconnect message', msg => this._disconnectMessage(msg));
    this._socket.on('need login', () => this._needLogin());
    this._socket.on('login error', msg => this._loginError(msg));
    this._socket.on('login success', () => this._loginSuccess());
  }
  
  /* SOCKET FUNCTIONS */
  // CONNECT
  _connect() {
    if ($('#xat-grid').length) {
      Utils.translate("message.connect", message => Utils.addSystemMessage(message, this._windowFocus));
      // Cache the disconnect message to be able to retrieve it when the server goes down
      Utils.translate("message.disconnect");
    }
  }
  
  // DISCONNECT
  _disconnect() {
    if ($('#xat-grid').length) {
      Utils.translate("message.disconnect", message => Utils.addSystemMessage(message, this._windowFocus));
    }
  }
  
  // CHAT MESSAGE
  _chatMessage({message, nick, nickColor}) {
    // Escape text from message to avoid html injection:
    let escapedMessage = $('<p></p>').text(message).html();
    let escapedNickColor = $('<p></p>').text(nickColor).html();
    let escapedNick = $('<p></p>').text(nick).html();
    Utils.addMessage('<strong style="color:' + escapedNickColor + '">' + escapedNick + ':</strong> ' + escapedMessage, this._windowFocus);
  }
  
  // CHAT IMAGE
  _chatImage({image, nick, nickColor}) {
    // Escape text from message to avoid html injection:
    let escapedImage = $('<p></p>').text(image).html();
    let escapedNickColor = $('<p></p>').text(nickColor).html();
    let escapedNick = $('<p></p>').text(nick).html();
    Utils.addMessage('<strong style="color:' + escapedNickColor + '">' + escapedNick +
        ':</strong> <img class="chat-image" src="/img/popupImage.png" data-src=" ' + escapedImage + '" />', this._windowFocus);
  }
  
  // COMMAND MESSAGE
  _commandMessage(message) {
    Utils.addMessage('<strong style="color:darkred">' + message + '</strong>', this._windowFocus);
  }
  
  // LOGIN MESSAGE
  _loginMessage({nick, users}) {
    Utils.translate("message.user.connected", message => Utils.addSystemMessage(message, this._windowFocus), {"user":nick});
    this._users = users;
    this._updateUsers();
  }
    
  // DISCONNECT MESSAGE
  _disconnectMessage({nick, users}) {
    Utils.translate("message.user.disconnected", message => Utils.addSystemMessage(message, this._windowFocus), {"user":nick});
    this._users = users;
    this._updateUsers();
  }
  
  // NEED LOGIN
  _needLogin() {
    // If we have the nick cached send it, else show the login window
    if (this._nick) {
      this.login(this._nick);
    } else {
      $("#login").show();
      $("#xat-grid").hide();
    }
  }
  // LOGIN ERROR
  _loginError(message) {
    $('#login-error').html(message);
  }
  
  // LOGIN SUCCESS
  _loginSuccess() {
    let nickColor = localStorage.getItem('nickColor');
    localStorage.setItem('lastNick', this._nick);
    
    $("#login").hide();
    $("#xat-grid").show();
    this._updateUsers();
    Utils.updateChatListHeigth();
    $("#message").focus();
    
    // Restore nick color
    if (nickColor) {
      $("#nick-color").val(nickColor);
    }
  }
  
  /* AUXILIAR FUNCTIONS */
  _updateUsers() {
    Utils.updateUsers(this._users, this._nick);
  }
  
  /* PUBLIC FUNTIONS */
  login(nick) {
    this._nick = nick;
    this._socket.emit('login', this._nick);
  }
  
  sendMessage(nickColor, message) {
    this._socket.emit('chat message', {nickColor, message});
  }
  
  sendImage(nickColor, image) {
    this._socket.emit('chat image', {nickColor, image});
  }
  
  /* GETTERS AND SETTERS */
  isWindowFocus() {
    return this._windowFocus;
  }
  
  setWindowFocus(windowFocus) {
    this._windowFocus = windowFocus;
  }
}
