import * as Utils from "./utils.js";

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
    this._socket.on("connect", () => this._connect());
    this._socket.on("disconnect", () => this._disconnect());
    this._socket.on("chat message", (msg) => this._chatMessage(msg));
    this._socket.on("chat image", (msg) => this._chatImage(msg));
    this._socket.on("is typing", (msg) => this._isTyping(msg));
    this._socket.on("command message", (msg) => this._commandMessage(msg));
    this._socket.on("login message", (msg) => this._loginMessage(msg));
    this._socket.on("disconnect message", (msg) =>
      this._disconnectMessage(msg)
    );
    this._socket.on("need login", () => this._needLogin());
    this._socket.on("login error", (msg) => this._loginError(msg));
    this._socket.on("login success", () => this._loginSuccess());
  }

  /* SOCKET FUNCTIONS */
  // CONNECT
  _connect() {
    if ($("#xat-grid").length) {
      Utils.translate("message.connect", (message) =>
        Utils.addSystemMessage(message, this._windowFocus)
      );
      $("#message").removeClass("disconnected");
      // Cache the disconnect message to be able to retrieve it when the server goes down
      Utils.translate("message.disconnect");
    }
  }

  // DISCONNECT
  _disconnect() {
    if ($("#xat-grid").length) {
      Utils.translate("message.disconnect", (message) =>
        Utils.addSystemMessage(message, this._windowFocus)
      );
      $("#message").addClass("disconnected");
    }
  }

  // CHAT MESSAGE
  _chatMessage({ message, nick, nickColor }) {
    // Escape text from message to avoid html injection:
    let escapedMessage = $("<p></p>").text(message).html();
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    escapedMessage = escapedMessage.replace(urlRegex, function (url) {
      return '<a href="' + url + '" target="_blank">' + url + "</a>";
    });
    let escapedNickColor = $("<p></p>").text(nickColor).html();
    let escapedNick = $("<p></p>").text(nick).html();
    Utils.addMessage(
      '<strong style="color:' +
        escapedNickColor +
        '">' +
        escapedNick +
        ":</strong> " +
        escapedMessage,
      this._windowFocus
    );
  }

  // CHAT IMAGE
  _chatImage({ image, nick, nickColor }) {
    // Escape text from message to avoid html injection:
    let escapedImage = $("<p></p>").text(image).html();
    let escapedNickColor = $("<p></p>").text(nickColor).html();
    let escapedNick = $("<p></p>").text(nick).html();
    Utils.addMessage(
      '<strong style="color:' +
        escapedNickColor +
        '">' +
        escapedNick +
        ':</strong> <img class="chat-image" src="/img/popupImage.png" data-src=" ' +
        escapedImage +
        '" />',
      this._windowFocus
    );
  }

  // IS TYPING
  _isTyping({ nick }) {
    $("#users li#" + nick.toLowerCase()).addClass("is-typing");
    setTimeout(() => {
      $("#users li#" + nick.toLowerCase()).removeClass("is-typing");
    }, 5000);
  }

  // LOCAL COMMAND
  _localParse(nickColor, command) {
    let localCommands = {
      loadTexts: () => this._loadTexts(),
      delTexts: () => this._delTexts(),
      text: (params) => this._printText(nickColor, params),
      t: (params) => this._printText(nickColor, params),
      clear: () => this._clear(),
      c: () => this._clear()
    };
    let isLocalCommand = false;

    let tokens = command.trim().split(" ");
    let [instruction, ...params] = tokens;

    if (localCommands[instruction]) {
      isLocalCommand = true;
      localCommands[instruction](params);
    }
    return isLocalCommand;
  }

  _loadTexts() {
    $("#file-input").trigger("click");
  }

  _delTexts() {
    localStorage.removeItem("texts");
    Utils.addMessage(
      '<strong style="color:darkblue">Texts Deleted</strong>',
      true
    );
  }

  _printText(nickColor, params) {
    let texts = JSON.parse(localStorage.getItem("texts"));
    let index = -1;
    let param = params[0];

    if (texts.length === 0) return;
    index = parseInt(param);

    // If user enters a number, substract one since array starts at 0
    if (!isNaN(index)) {
      index--;
    }

    if (isNaN(index) || index < 0 || index > texts.length) {
      index = Math.floor(Math.random() * texts.length);
    }

    let message = "[" + (index + 1) + "]: " + texts[index];
    this._socket.emit("chat message", { nickColor, message });
  }

  _clear() {
    $("#messages").empty();
  }

  // COMMAND MESSAGE
  _commandMessage(message) {
    Utils.addMessage(
      '<strong style="color:darkred">' + message + "</strong>",
      this._windowFocus
    );
  }

  // LOGIN MESSAGE
  _loginMessage({ nick, users }) {
    Utils.translate(
      "message.user.connected",
      (message) => Utils.addSystemMessage(message, this._windowFocus),
      { user: nick }
    );
    this._users = users;
    this._updateUsers();
  }

  // DISCONNECT MESSAGE
  _disconnectMessage({ nick, users }) {
    Utils.translate(
      "message.user.disconnected",
      (message) => Utils.addSystemMessage(message, this._windowFocus),
      { user: nick }
    );
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
    $("#login-error").html(message);
  }

  // LOGIN SUCCESS
  _loginSuccess() {
    let nickColor = localStorage.getItem("nickColor");
    localStorage.setItem("lastNick", this._nick);

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
    this._socket.emit("login", this._nick);
  }

  sendMessage(nickColor, message) {
    if (message.startsWith("/")) {
      if (this._localParse(nickColor, message.substring(1))) return;
    }
    this._socket.emit("chat message", { nickColor, message });
  }

  sendImage(nickColor, image) {
    this._socket.emit("chat image", { nickColor, image });
  }

  isTyping() {
    this._socket.emit("is typing");
  }

  /* GETTERS AND SETTERS */
  isWindowFocus() {
    return this._windowFocus;
  }

  setWindowFocus(windowFocus) {
    this._windowFocus = windowFocus;
  }
}
