$(function () {
  let socket = io();
  
  // Keep a variable to know if the window has focus
  $(window).focus(function() {
      windowFocus = true;
      document.title = "XatBy2";
  }).blur(function() {
      windowFocus = false;
  });
  
  // Submit the login
  $('body').on('submit', '#login', function() {
  	nick = $('#nick').val();
    socket.emit('login', nick);
    return false;
  });
  
  // Submit a chat message
  $('body').on('submit','#xat', function() {
  	let nickColor = $('#nick-color').val();
    socket.emit('chat message', {'nick-color':nickColor, 'message': $('#message').val()});
    
    // We want the nick color stored across sessions
    localStorage.setItem('nickColor', nickColor);
    $('#message').val('');
    return false;
  });
  
  // On Windows resize
  $(window).resize(function() {
    updateXatListHeigth()
  });
  
  //On chat icon image click (Open popup)
  $("#xat-grid").on("click", "li img.chat-image", function() {
    $("#chat-image img").attr("src", $(this).data("src"));
    $("#chat-image").show();
  });
  
  // On popup image click (Close popup)
  $("#chat-image").click(function() {
    $("#chat-image").hide();
  });
  
  // On paste from clipboard (an image)
  document.onpaste = function(event) {
  	let items = (event.clipboardData || event.originalEvent.clipboardData).items;
    for (index in items) {
    	let item = items[index];
      if (item.kind === 'file') {
      	let blob = item.getAsFile();
      	let reader = new FileReader();
        reader.onload = function(event) {
        	let data = event.target.result;
        	if (data.startsWith("data:image")) {
        		let nickColor = $('#nick-color').val();
        		socket.emit('chat image', {'nick-color':nickColor, 'image': data});
        	}
        }
        reader.readAsDataURL(blob);
      }
    }
  }
  
  // Socket
  // CONNECT -
  socket.on('connect', function() {
    console.log('Socket is connected.');
    if ($('#xat-grid').length) {
    	addSystemMessage('Server is up and ready!');
    }
  });

  // DISCONNECT -
  socket.on('disconnect', function() {
    console.log('Socket is disconnected.');
    if ($('#xat-grid').length) {
    	addSystemMessage('Server went down, waiting for reconnection...');
    }
  });
  
  // CHAT MESSAGE - {message, nick, nick-color}
  socket.on('chat message', function(msg) {
  	// Escape text from message to avoid html injection:
  	let escapedMessage = $('<p></p>').text(msg.message).html()
    addMessage('<strong style="color:' + msg['nick-color'] + '">' + msg.nick + ':</strong> ' + escapedMessage);
  });
  
  // CHAT IMAGE - {image, nick, nick-color}
  socket.on('chat image', function(msg) {
    addMessage('<strong style="color:' + msg['nick-color'] + '">' + msg.nick +
    		':</strong> <img class="chat-image" src="/img/popupImage.png" data-src=" ' + msg.image + '" />');
  });
  
  // LOGIN MESSAGE - {nick, users}
  socket.on('login message', function(msg) {
  	addSystemMessage(msg.nick + ' connected.');
    users = msg.users;
    updateUsers();
  });
  
  // DISCONNECT MESSAGE - {nick, users}
  socket.on('disconnect message', function(msg) {
  	addSystemMessage(msg.nick + ' disconnected.');
    users = msg.users;
    updateUsers();
  });
  
  // NEED LOGIN -
  socket.on('need login', function() {
  	// If we have the nick cached send it, else show the login window
  	if (nick) {
  		socket.emit('login', nick);
  	} else {
  		$("#login").show();
      $("#xat-grid").hide();
  	}
  });
  
  // LOGIN ERROR - message
  socket.on('login error', function(msg) {
    $('#login-error').html(msg);
  });
  
  // LOGIN SUCCESS -
  socket.on('login success', function() {
  	let nickColor = localStorage.getItem('nickColor');
    
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

let users = {};
let nick;
let windowFocus = true;

function updateUsers() {
	$("#users").empty();
	for (let i=0; i<users.length; i++) {
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