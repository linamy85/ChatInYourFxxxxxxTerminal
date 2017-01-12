
// Connects to socket.io server.
//
var userlist = {}
var counter = 0;

$(document).ready(function() {
  var username = $("#username").text();
  $.ajax({
    type: 'POST',
    url: '/message/' + getRoomId(),
    success: function(data) {
      //console.log(data)
      socketRegister(data)
    },
    //contentType: "application/json",
    dataType: 'json'
  });
});

function socketRegister(data) {
  var username = $("#username").text();
  console.log("My name is:", username)

  var socket = io({
    'connect timeout': 5000
  });

  data.forEach(function(msg) {
    if (username == msg.sender) {
      $('#messages').append($('<li id="'+msg._id+'">')
        .text(msg.text).css("text-align", "right"));
      $('#'+msg._id).dblclick(function() {
        if (confirm("Delete message:", msg.text, "?")) {
          socket.emit("delete msg", msg._id)
        }
      })
    } else {
      $('#messages').append($('<li id="'+msg._id+'">').text("["+msg.sender+"] "+msg.text));
    }
  })

  var roomid = getRoomId() ;
  console.log(socket)

  socket.on('connect', function() {
    socket.emit('set name', username);
    socket.emit('join room', roomid);
    console.log("Server ensures me to join", roomid);
  })

  socket.on('Room meta', function(status) {
    console.log("Room member status:", status);
    userlist = status;
    render_users();
  })

  socket.on('Room meta error', function() {
    console.log("Room member status loading error!");
  })

  socket.on('Online', function(username) {
    console.log('User', username, 'is online!')
    userlist[username] = true;
    render_users();
  })

  socket.on('Offline', function(username) {
    console.log('User', username, 'is offline!')
    userlist[username] = false
    render_users();
  })

  // Gets message
  socket.on('chat message', function(sender, msg, id){
    $('#messages').append($('<li id="'+id+'">').text("["+sender+"] "+msg));
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

  // Gets server submit msg success response.
  socket.on('Message id', function(index, id) {
    console.log('Message #', index, '=>', id);
    $('#'+index).attr("id", id.toString());
    $('#'+id).dblclick(function() {
      if (confirm("Delete message:", $('#'+id).text(), "?")) {
        socket.emit("delete msg", id)
      }
    })
  });

  // Removes message confirmed by server.
  socket.on('delete msg confirm', function(id) {
    $('#'+id).remove();
    console.log('ID', id, 'removed.');
  })

  // Submits message.
  $('#msg-form').submit(function(){
    console.log('in');
    let msg = $('#m').val();
    socket.emit('chat message', msg, counter);
    $('#m').val('');
    $('#messages').append($('<li id="'+counter+'">').text(msg)
      .css("text-align", "right"));
    counter = (counter + 1) % 100000000;  // Avoids overflow.
    return false;
  });
}

function getRoomId() {
  let url = window.location.href;
  url = url.split('/');
  let id = url[ url.length - 1 ];
  return id.replace("$#?", "")
}

function render_users() {
  $('#onlinelist').text("Say chao with: ")
  for (var name in userlist) {
    if (userlist[name])
      $('#onlinelist').append('<font color="red">'+name+' </font>')
    else
      $('#onlinelist').append('<font color="blue">'+name+' </font>')
  }
}

