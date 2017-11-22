$(function () {
  var socket = io();
  var users = {};
  
  $('body').on('submit', '#login', function(){
    socket.emit('login', $('#nick').val());
    return false;
  });
  
  $('body').on('submit','#xat', function(){
    socket.emit('chat message', {'nick-color':$('#nick-color').val(), 'message': $('#message').val()});
    $('#message').val('');
    return false;
  });
  
  socket.on('chat message', function(msg){
    addMessage('<strong style="color:' + msg['nick-color'] + '">' + msg.nick + ':</strong> ' + msg.message);
  });
  
  socket.on('num users', function(msg){
    $('#numUsers').html(msg);
  });
  
  socket.on('login message', function(msg){
    addMessage('<strong style="color:red">' + msg.nick + ' connected.</strong>');
    users = msg.users;
    updateUsers();
  });
  
  socket.on('disconnect message', function(msg){
    addMessage('<strong style="color:red">' + msg.nick + ' disconnected.</strong>');
    users = msg.users;
    updateUsers();
  });
  
  socket.on('login error', function(msg){
    $('#login-error').html(msg);
  });
  
  socket.on('login success', function(msg){
    $.post('xat')
    .done(function(data){
        $("body").html(data);
        updateUsers();
        updateXatListHeigth();
        $("#message").focus();
    });
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
    $('#messages').append($('<li>').append(message));
    $("#messages").scrollTop($("#messages")[0].scrollHeight);
  }
});