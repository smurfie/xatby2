module.exports = class ServerCommandParser {
  constructor(socket, io) {
    this._socket = socket;
    this._io = io;
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
      this._sendMessage("'" + instruction + "' is not a command. Write /help or /? for a list of all possible commands.");
    }
  }
  
  _roll(parameters) {
  	
  }
  
  _help(parameters) {
    if (parameters.length === 0) {
      this._sendMessage(`Possible commands: ${Object.keys(this._commands).join(", ")}`);
      this._sendMessage("Write: '/help [command]' for more information.");
    } else {
    	let helpAbout = parameters[0];
    	switch (helpAbout) {
    		case '?':
    		case 'help':
    			this._sendMessage("Use /help or /? to obtain a list of all commands. Also you can use '/help [command]' to obtain help about one command");
    			this._sendMessage("But you already know, didn't you?");
    			break;
    		default:
    			if (this._commands[helpAbout]) {
    				this._sendMessage("There is no help about this command, ask the developer to implement it!");
    			} else {
    				this._sendMessage("'" + helpAbout + "' is not a command.");
    			}
    	}
    }
  }
  
  _sendMessage(message) {
    this._socket.emit('command message', message);
  }
}