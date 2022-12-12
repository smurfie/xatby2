let translateCache = {};

// Updates the user list (right-side) with the users passed as parameter
export function updateUsers(users, nick) {
  $("#users").empty();
  for (let i = 0; i < users.length; i++) {
    $("#users").append(
      (users[i] === nick ? '<li class="yourself"' : "<li") +
        " id='" +
        users[i].toLowerCase() +
        "'>" +
        users[i] +
        "</li>"
    );
  }
  $("#message").toggleClass("alone", users.length == 1);
}

// Adds a message to the chat and prepends the actual date
export function addMessage(message, windowFocus, isSystem) {
  // if the list isn't created yet return;
  if (!$("#messages").length) return;

  $("#messages").append(
    $("<li" + (isSystem ? " class='system'" : "") + ">").append(
      "(" +
        _formatDate(new Date()) +
        ") <span class='text'>" +
        message +
        "</span>"
    )
  );
  $("#messages").scrollTop($("#messages")[0].scrollHeight);
  if (!windowFocus && $("#xat-grid").is(":visible")) {
    document.title = "(*) XatBy2";
  }
}

// Adds a system message to the chat
export function addSystemMessage(message, windowFocus) {
  addMessage(message, windowFocus, true);
}

// Format the date to the format HH:MM:SS
function _formatDate(date) {
  return (
    _twoCharsNumber(date.getHours()) +
    ":" +
    _twoCharsNumber(date.getMinutes()) +
    ":" +
    _twoCharsNumber(date.getSeconds())
  );
}

// Converts a number of 1 or 2 characters to a string/number of 2 characters
function _twoCharsNumber(number) {
  return (number + "").length < 2 ? "0" + number : number;
}

// Updates the chat height to fit the size of the browser window
export function updateChatListHeigth() {
  $("#messages").css(
    "max-height",
    window.innerHeight - $("#xat").outerHeight()
  );
}

// Sends a key to translate to the server optionally with params and executes the callback when finished.
// If callback is not set the function only caches the result for future uses
export function translate(key, callback, params) {
  if (!params && translateCache[key]) {
    callback && callback(translateCache[key]);
  } else {
    $.post(
      "/translate",
      { key, params: JSON.stringify(params) },
      function (data) {
        if (!params) {
          translateCache[key] = data;
        }
        callback && callback(data);
      },
      "json"
    );
  }
}

// HISTORY
const historySize = 50;
let history = getHistory();
let historyPos = 0;
let actualMessage = "";

export function getHistory() {
  let savedHistory = JSON.parse(localStorage.getItem("history")) || [];
  if (!Array.isArray(savedHistory)) {
    savedHistory = [];
  }
  return savedHistory;
}

export function addHistoryMessage(message) {
  history.unshift(message);
  actualMessage = "";
  if (history.length > historySize) {
    history.pop();
  }
  localStorage.setItem("history", JSON.stringify(history));
}

export function getPreviousHistory(currentMessage) {
  if (historyPos == 0) {
    actualMessage = currentMessage;
  }
  if (historyPos < history.length) {
    historyPos++;
  }
  return history[historyPos - 1];
}

export function getNextHistory() {
  if (historyPos > 0) {
    historyPos--;
  }
  return historyPos == 0 ? actualMessage : history[historyPos - 1];
}
