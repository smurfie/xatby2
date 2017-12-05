let Utils = require('./utils');

module.exports = class ServerCommandParser {
  constructor(socket, io) {
    this._socket = socket;
    this._io = io;
    this._req = socket.request;
    this._nick = "";
    this._commands = {
      '?':            (params) => this._help(params),
      'help':         (params) => this._help(params),
      'roll':         (params) => this._roll(params)
    };
  }
  
  parse(command) {
    let tokens = command.trim().split(" ");
    let [instruction, ...params] = tokens;
    if (this._commands[instruction]) {
      this._commands[instruction](params);
    } else {
      this._sendMessage(this._req.__("command.instruction.not.a.command", {instruction}));
    }
  }
  
  setNick(nick) {
    this._nick = nick;
  }
  
  _roll(parameters) {
  	if (parameters.length === 0) {
      parameters = ["1D6"];
    }
    let dices = parameters[0].toUpperCase();
    if (!dices.match(/^\d{1,2}D\d{1,4}$/)) {
      this._sendMessage(this._req.__("command.roll.error"));
    } else {
      let [numDices, facesDice] = dices.split("D");
      if (numDices<1 || numDices>20 || facesDice<1 || facesDice>1000) {
        this._sendMessage(this._req.__("command.roll.error"));
      } else {
        let total = 0;
        let values = [];
        for (let i=0; i<numDices; i++) {
          let num = Utils.random(1, facesDice);
          total += num;
          values.push(num);
        }
        this._sendMessageAll(this._req.__("command.roll", {"user": this._nick, dices, result: total + (numDices>1 ? " (" + values.join(", ") + ")" : "")}));
      }
    }
  }
  
  _help(parameters) {
    if (parameters.length === 0) {
      this._sendMessage(this._req.__("command.help.1", {commands: Object.keys(this._commands).join(", ")}));
      this._sendMessage(this._req.__("command.help.2"));
    } else {
    	let helpAbout = parameters[0];
    	switch (helpAbout) {
    		case '?':
    		case 'help':
    			this._sendMessage(this._req.__("command.help.help.1"));
    			this._sendMessage(this._req.__("command.help.help.2"));
    			break;
        case 'roll':
          this._sendMessage(this._req.__("command.help.roll.1"));
          this._sendMessage(this._req.__("command.help.roll.2"));
          break;
    		default:
    			if (this._commands[helpAbout]) {
    				this._sendMessage(this._req.__("command.help.default.command"));
    			} else {
    				this._sendMessage(this._req.__("command.help.default.not.command", {command: helpAbout}));
    			}
    	}
    }
  }
  
  _sendMessage(message) {
    this._socket.emit('command message', message);
  }
  
  _sendMessageAll(message) {
    this._io.emit('command message', message);
  }
}