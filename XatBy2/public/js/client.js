$(function () {
  var socket = io();
  
  // Keep a variable to know if the window has focus
  $(window).focus(function() {
      windowFocus = true;
      document.title = "XatBy2";
  }).blur(function() {
      windowFocus = false;
  });
  
  $('body').on('submit', '#login', function(){
  	nick = $('#nick').val();
    socket.emit('login', nick);
    return false;
  });
  
  $('body').on('submit','#xat', function(){
  	var nickColor = $('#nick-color').val();
    socket.emit('chat message', {'nick-color':nickColor, 'message': $('#message').val()});
    
    // We want the nick color stored across sessions
    localStorage.setItem('nickColor', nickColor);
    $('#message').val('');
    return false;
  });
  
  $(window).resize(function() {
    updateXatListHeigth()
  });
  
  $("#chat-image").click(function() {
    $("#chat-image").hide();
  });
  
  $("#xat-grid").on("click", "li img.chat-image", function() {
    $("#chat-image img").attr("src", $(this).data("src"));
    $("#chat-image").show();
  });
  
  document.onpaste = function(event){
    var items = (event.clipboardData || event.originalEvent.clipboardData).items;
    for (index in items) {
      var item = items[index];
      if (item.kind === 'file') {
        var blob = item.getAsFile();
        var reader = new FileReader();
        reader.onload = function(event){
        	var data = event.target.result;
        	if (data.startsWith("data:image")) {
        		var nickColor = $('#nick-color').val();
        		socket.emit('chat image', {'nick-color':nickColor, 'image': data});
        	}
        }
        reader.readAsDataURL(blob);
      }
    }
  }
  
  // Socket
  socket.on('connect', function () {
    console.log('Socket is connected.');
    if ($('#xat-grid').length) {
    	addSystemMessage('Server is up and ready!');
    }
  });

  socket.on('disconnect', function () {
    console.log('Socket is disconnected.');
    if ($('#xat-grid').length) {
    	addSystemMessage('Server went down, waiting for reconnection...');
    }
  });
  
  socket.on('chat message', function(msg){
  	// Escape text from message to avoid html injection:
  	var escapedMessage = $('<p></p>').text(msg.message).html()
    addMessage('<strong style="color:' + msg['nick-color'] + '">' + msg.nick + ':</strong> ' + escapedMessage);
  });
  
  socket.on('chat image', function(msg){
    addMessage('<strong style="color:' + msg['nick-color'] + '">' + msg.nick + ':</strong> <img class="chat-image" src="/img/popupImage.png" data-src=" ' + msg.image + '" />');
  });
  
  socket.on('num users', function(msg){
    $('#numUsers').html(msg);
  });
  
  socket.on('login message', function(msg){
  	addSystemMessage(msg.nick + ' connected.');
    users = msg.users;
    updateUsers();
  });
  
  socket.on('disconnect message', function(msg){
  	addSystemMessage(msg.nick + ' disconnected.');
    users = msg.users;
    updateUsers();
  });
  
  socket.on('need login', function(msg){
  	// If we have the nick cached send it, else show the login window
  	if (nick) {
  		socket.emit('login', nick);
  	} else {
  		$("#login").show();
      $("#xat-grid").hide();
  	}
  });
  
  socket.on('login error', function(msg){
    $('#login-error').html(msg);
  });
  
  socket.on('login success', function(msg){
    var nickColor = localStorage.getItem('nickColor');
    
    $("#login").hide();
    $("#xat-grid").show();
    updateUsers();
    updateXatListHeigth();
    $("#message").focus();
    
    // Restore nick color
    if (nickColor) {
      $("#nick-color").val(nickColor);
    }
  });
});

var users = {};
var nick;
var windowFocus = true;

function updateUsers() {
	$("#users").empty();
	for (var i=0; i<users.length; i++) {
		$("#users").append((users[i]===nick ? '<li class="yourself">' : '<li>') + users[i] + '</li>');
	}
}

function updateXatListHeigth() {
	$('#messages').css("max-height", window.innerHeight - $("#xat").outerHeight());
}

function addMessage(message) {
	// if the list isn't created yet return;
	if (!$("#messages").length) return;
	
	$('#messages').append($('<li>').append("(" + formatDate(new Date()) + ") " + message));
	$("#messages").scrollTop($("#messages")[0].scrollHeight);
	if (!windowFocus) {
		document.title = "(*) XatBy2";
	}
}

function addSystemMessage(message) {
	addMessage('<strong style="color:red">' + message + '</strong>');
}

function formatDate(date) {
	return twoCharsNumber(date.getHours()) + ":" + twoCharsNumber(date.getMinutes()) + ":" + twoCharsNumber(date.getSeconds());
}

function twoCharsNumber(number) {
	return (number+"").length<2 ? "0" + number : number; 
}