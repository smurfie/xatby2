import ClientSocketManager from './clientSocketManager.js';
import * as Utils from './utils.js';

$(function () {
  let clientSocketManager = new ClientSocketManager();
  
  // Disable cache
  $.ajaxSetup ({
    cache: false
  });

  // Keep a variable to know if the window has focus
  $(window).focus(function() {
    clientSocketManager.setWindowFocus(true);
    document.title = "XatBy2";
  }).blur(function() {
    clientSocketManager.setWindowFocus(false);
  });
  
  // Submit the login
  $('body').on('submit', '#login', function() {
    clientSocketManager.login($('#nick').val());
    return false;
  });
  
  // Submit a chat message
  $('body').on('submit','#xat', function() {
  	let nickColor = $('#nick-color').val();
    clientSocketManager.sendMessage(nickColor, $('#message').val());
    
    // We want the nick color stored across sessions
    localStorage.setItem('nickColor', nickColor);
    $('#message').val('');
    return false;
  });
  
  // On Windows resize
  $(window).resize(function() {
    Utils.updateChatListHeigth();
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
    for (let index in items) {
    	let item = items[index];
      if (item.kind === 'file') {
      	let blob = item.getAsFile();
      	let reader = new FileReader();
        reader.onload = function(event) {
        	let data = event.target.result;
        	if (data.startsWith("data:image")) {
        		let nickColor = $('#nick-color').val();
            clientSocketManager.sendImage(nickColor, data);
        	}
        }
        reader.readAsDataURL(blob);
      }
    }
  }
});