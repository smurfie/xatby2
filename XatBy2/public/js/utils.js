// Updates the user list (right-side) with the users passed as parameter
export function updateUsers(users, nick) {
  $("#users").empty();
  for (let i=0; i<users.length; i++) {
    $("#users").append((users[i]===nick ? '<li class="yourself">' : '<li>') + users[i] + '</li>');
  }
}

// Adds a message to the chat and prepends the actual date
export function addMessage(message, windowFocus) {
  // if the list isn't created yet return;
  if (!$("#messages").length) return;
  
  $('#messages').append($('<li>').append("(" + _formatDate(new Date()) + ") " + message));
  $("#messages").scrollTop($("#messages")[0].scrollHeight);
  if (!windowFocus) {
    document.title = "(*) XatBy2";
  }
}

// Adds a system message to the chat
export function addSystemMessage(message, windowFocus) {
  addMessage('<strong style="color:red">' + message + '</strong>', windowFocus);
}

// Format the date to the format HH:MM:SS
function _formatDate(date) {
  return _twoCharsNumber(date.getHours()) + ":" + _twoCharsNumber(date.getMinutes()) + ":" + _twoCharsNumber(date.getSeconds());
}

// Converts a number of 1 or 2 characters to a string/number of 2 characters
function _twoCharsNumber(number) {
  return (number+"").length<2 ? "0" + number : number; 
}

// Updates the chat height to fit the size of the browser window
export function updateChatListHeigth() {
  $('#messages').css("max-height", window.innerHeight - $("#xat").outerHeight());
}
