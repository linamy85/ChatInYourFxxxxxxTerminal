function reloadrooms() {
  if (!document.getElementById('roomlist')) {
    console.log("Not login yet.")
    return
  }
  $.get('/rooms', function(data) {
    $('#roomlist').empty()
    console.log(data);

    data.forEach(function(room) {
      console.log(room)
      $('#roomlist').append(
        '<li><a href="/message/'+room._id+'">'+room.name+'</a></li>'
      )
    })
  })
}

$(document).ready(function() {
  reloadrooms();
})

function createroom() {
  var name = prompt("Room name plz:")
  if (name === null) {  // User cancelled creating room.
    return;
  } else if (name == '') {
    alert("No empty room name!!!")
    return;
  }

  var index = 0;
  var list = [];
  var curuser = "";
  while (true) {
    var curuser = prompt(
      "Invite user #"+index+" to join chat! "+
      "(empty string for end of user list)"
    )
    if (curuser === null) {
      console.log("User cancelled creating room.")
      return;
    } else if (curuser == "") {
      break;
    }
    list.push(curuser)
    index += 1;
  }

  console.log("Room:", name)
  console.log("Users:", list)
  
  $.ajax({
    type: 'POST',
    url: '/rooms/new',
    data: JSON.stringify({users: list, roomid: name}), // or JSON.stringify ({name: 'jonas'}),
    success: function(data) {
      console.log(data)
      reloadrooms()
    },
    contentType: "application/json",
    dataType: 'json'
  });
}
