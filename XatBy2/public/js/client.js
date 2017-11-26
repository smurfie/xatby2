$(function () {
  var socket = io();
  var users = {};
  var windowFocus = true;
  
  // Keep a variable to know if the window has focus
  $(window).focus(function() {
      windowFocus = true;
      document.title = "XatBy2";
  }).blur(function() {
      windowFocus = false;
  });
  
  $('body').on('submit', '#login', function(){
  	var nick = $('#nick').val();
    socket.emit('login', nick);
    sessionStorage.setItem('nick', nick);
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
  
  socket.on('connect', function () {
    console.log('Socket is connected.');
    if ($('#xat-grid').length) {
    	addMessage('Server is up and ready!');
    }
  });

  socket.on('disconnect', function () {
    console.log('Socket is disconnected.');
    if ($('#xat-grid').length) {
    	addMessage('Server went down, waiting for reconnection...');
    }
  });
  
  socket.on('chat message', function(msg){
  	// Escape text from message to avoid html injection:
  	var escapedMessage = $('<p></p>').text(msg.message).html()
    addMessage('<strong style="color:' + msg['nick-color'] + '">' + msg.nick + ':</strong> ' + escapedMessage);
  });
  
  socket.on('num users', function(msg){
    $('#numUsers').html(msg);
  });
  
  socket.on('login message', function(msg){
  	//This message won't show for self because probably the xat window isn't still created
    addMessage('<strong style="color:red">' + msg.nick + ' connected.</strong>');
    users = msg.users;
    updateUsers();
  });
  
  socket.on('disconnect message', function(msg){
    addMessage('<strong style="color:red">' + msg.nick + ' disconnected.</strong>');
    users = msg.users;
    updateUsers();
  });
  
  socket.on('need login', function(msg){
  	var nick = sessionStorage.getItem('nick');
  	
  	//If we are in the login window, wait for the user to enter his nick; (do nothing)
  	if ($("#nick").length) {
  		return;
  	}

  	// If we have the nick cached send it, else reload to go to login window
  	if (nick) {
  		socket.emit('login', nick);
  	} else {
  		//Reload
  		location.reload();
  	}
  });
  
  socket.on('login error', function(msg){
    $('#login-error').html(msg);
  });
  
  socket.on('login success', function(msg){
  	// If we are in the login window load the xat window
  	if ($("#nick").length) {
	    $.post('xat')
	    .done(function(data){
	    		var nickColor = localStorage.getItem('nickColor');
	    		
	        $("body").html(data);
	        updateUsers();
	        updateXatListHeigth();
	        $("#message").focus();
	        
	        // Restore nick color
	        if (nickColor) {
	        	$("#nick-color").val(nickColor);
	        }
	    });
  	}
  });
  
  $( window ).resize(function() {
    updateXatListHeigth()
  });
  
  function updateUsers() {
    $("#users").empty();
    for (var i=0; i<users.length; i++) {
      $("#users").append('<li>' + users[i] + '</li>');
    }
  }
  
  function updateXatListHeigth() {
     $('#messages').css("max-height", window.innerHeight - $("#xat").outerHeight());
  }
  
  function addMessage(message) {
    // if the list isn't created yet return;
    if (!$("#messages").length) return;
    
    var today = new Date();
    $('#messages').append($('<li>').append("(" + today.getHours() + ":" + today.getMinutes() + ") " + message));
    $("#messages").scrollTop($("#messages")[0].scrollHeight);
    if (!windowFocus) {
      document.title = "(*) XatBy2";
    }
  }
});