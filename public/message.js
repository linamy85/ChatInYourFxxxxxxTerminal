
// Connects to socket.io server.
//
var userlist = {}
var counter = 0;
var disconnect = true;
var username = $("#username").text();

function reloadmsgs() {
  $.ajax({
    type: 'POST',
    url: '/message/' + getRoomId(),
    success: function(data) {
      $('#messages').empty();
      data.forEach(function(msg) {
        if (username == msg.sender) {
          $('#messages').append($('<li id="'+msg._id+'">')
            .html(msg.text).css("text-align", "right"));
          $('#'+msg._id).dblclick(function() {
            if (disconnect) {
              alert("You're disconnected now...");
              return false;
            }
            if (confirm("Delete message:", msg.text, "?")) {
              socket.emit("delete msg", msg._id)
            }
          })
        } else {
          $('#messages').append(
            $('<li id="'+msg._id+'">').html("["+msg.sender+"] "+msg.text));
        }
      })
    },
    dataType: 'json'
  });

}

$(document).ready(function() {
  socketRegister();
});

function socketRegister(data) {
  console.log("My name is:", username)

  var socket = io({
    'connect timeout': 5000
  });


  var roomid = getRoomId() ;
  console.log(socket)

  socket.on('connect', function() {
    //show state
    $('#state').append($('<font color="#6d84b4">Connected</font>')
      .css("text-align", "right"));
    reloadmsgs();
    freeAllForm();
    disconnect = false;
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
  // ////////////
  // socket.on('instant msg', function(data){
  //   console.log(data.message);
  // });
  // Gets message
  socket.on('chat message', function(sender, msg, id){
    $('#messages').append($('<li id="'+id+'">').html("["+sender+"] "+msg));
  });

  // Disconnect from server.
  socket.on('disconnect', function(msg){
    //show state
    $('#state').append($('<font color="#6d84b4">Disconnected</font>')
      .css("text-align", "right"));
    // Disable all of the forms.
    disableAllForm();

    disconnect = true;
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
    if (disconnect) {
      alert("You're disconnected now...");
      return false;
    }
    console.log('in');
    let msg = $('#m').val();
    socket.emit('chat message', msg, counter);
    $('#m').val('');
    $('#messages').append($('<li id="'+counter+'">').html(msg)
      .css("text-align", "right"));
    counter = (counter + 1) % 100000000;  // Avoids overflow.
    return false;
  });
  // File Transfer
  $('#file-form').ajaxForm(function(names){
    console.log('file in');
    if (disconnect) {
      alert("You're disconnected now...");
      return false;
    }
    var len = names.length;
    msg = "";
    for(var i=0; i<len; i++){
        if(i!=0) msg += '<br>';
        msg += '<a target="_blank" href="/uploads/'+names[i]+'">'+names[i]+'</a>';
   }
    socket.emit('chat message', msg, counter);
    $('#messages').append($('<li id="'+counter+'">').css("text-align", "right").html(msg));
    counter = (counter + 1) % 100000000;
    return;
  }, 'json');
}
       

function getRoomId() {
  let url = window.location.href;
  url = url.split('/');
  let id = url[ url.length - 1 ];
  return id.replace("$#?", "")
}

function render_users() {
  $('#onlinelist').text("Chating with ")
  for (var name in userlist) {
    if (userlist[name])
      $('#onlinelist').append('<font color="orange">'+name+' </font>')
    else
      $('#onlinelist').append('<font color="white">'+name+' </font>')
  }
}

// Registers enter key for search query.
$("#search").bind("enterKey",function(e){
  $.ajax({
    type: 'POST',
    url: '/message/_search',
    data: JSON.stringify({
      room: getRoomId(),
      query: $("#search").val() 
    }),
    success: function(data) {
      console.log(data)
      $("#result-insert").empty()
      data.forEach(function(msg, idx, arr) {
        $("#result-insert").append('<tr>'+
          '<th scope="row">'+idx+'</th>'+
          '<td>'+msg.created_at+'</td>'+
          '<td>'+msg.sender+'</td>'+
          '<td>'+msg.text+'</td></tr>')
      })
      $('#result-modal').modal('show') 
    },
    contentType: "application/json",
    dataType: 'json'
  });
});

$("#search").keyup(function(e){
  if(e.keyCode == 13) {
    $(this).trigger("enterKey");
  }
});

function disableAllForm() {
  console.log("Disable all form inputs.")
  $("#msg-form :input").prop('readonly', true);
  $("#file-form :input").prop('readonly', true);
  $("#search").prop('readonly', true);
}

function freeAllForm() {
  console.log("Free all form inputs!")
  $("#msg-form :input").prop('readonly', false);
  $("#file-form :input").prop('readonly', false);
  $("#search").prop('readonly', false);
}
