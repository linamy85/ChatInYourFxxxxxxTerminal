var express = require('express');
var router = express.Router();

var Chatroom = require('../models/chatroom');
var Message = require('../models/message');

router.post('/:room', function(req, res) {
  console.log(req.params)
  Message.find({roomID: req.params.room}, function(err, msgs) {
    if (err) {
      res.status(500).send("Load messages in room error.")
      return console.log("Load message from room:", err)
    }
    //console.log("Finds", msgs)
    res.json(msgs)
  })
})

router.get('/:room', function(req, res) {
  console.log(req.params)
  console.log(req.user.username, "enters room", req.params.room);
  Chatroom.findById(req.params.room, function(err, room) {
    if (err) {
      res.status(500).send("Load chatroom error.")
      return console.log("Load chatroom: ", err)
    }
    if (room.users.indexOf(req.user.username) < 0) {
      console.log("User", req.user.username, "tried to hack into", room.name)
      // TODO: hack page
      res.render('hack', {user: req.user})
    }
    console.log("Found ", req.params.room, "->", room)
    res.render('message', {
      user: req.user,
      room: room,
    });
  })
});


module.exports = router;
