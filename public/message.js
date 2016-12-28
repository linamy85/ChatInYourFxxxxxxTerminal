
// Connects to socket.io server.

$(document).ready(function() {
  var username = $("#username").text();
  $.ajax({
    type: 'POST',
    url: '/message/' + getRoomId(),
    success: function(data) {
      //console.log(data)
      data.forEach(function(msg) {
        if (username == msg.sender) {
          $('#messages').append($('<li>').text(msg.text).css("text-align", "right"));
        } else {
          $('#messages').append($('<li>').text("["+msg.sender+"] "+msg.text));
        }
      })
      socketRegister()
    },
    //contentType: "application/json",
    dataType: 'json'
  });
});

function socketRegister() {
  var username = $("#username").text();
  console.log("My name is:", username)

  var socket = io({
    'connect timeout': 5000
  });
  var roomid = getRoomId() ;
  console.log(socket)

  socket.on('connect', function() {
    socket.emit('join room', roomid);
    socket.emit('set name', username);
    console.log("Server ensures me to join", roomid);
  })

  // Gets message
  socket.on('chat message', function(sender, msg){
    $('#messages').append($('<li>').text("["+sender+"] "+msg));
  });

  // Disconnect from server.
  socket.on('disconnect', function(msg){
    console.log('disconnected');
    socket = io({'connect timeout': 5000});
  });

  // Socket.io server error.
  socket.on('connect_error', function(){
    console.log('Pusheen misses you.');
  });

  // Submits message.
  $('#msg-form').submit(function(){
    console.log('in');
    let msg = $('#m').val();
    socket.emit('chat message', msg);
    $('#m').val('');
    $('#messages').append($('<li>').text(msg).css("text-align", "right"));
    return false;
  });
}

function getRoomId() {
  let url = window.location.href;
  url = url.split('/');
  let id = url[ url.length - 1 ];
  return id.replace("$#?", "")
}

