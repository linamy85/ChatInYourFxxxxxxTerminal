var express = require('express');
var router = express.Router();

var Chatroom = require('../models/chatroom');
var Message = require('../models/message');

router.post('/_search', function(req, res) {
  console.log(req.user.username, req.body)
  // Security checking first.
  Chatroom.findById(req.body.room, function(err, room) {
    if (err) {
      console.log("Checking user in room error", err);
      res.status(500).send("Checking query security error")
    }
    if (room.users.indexOf(req.user.username) < 0) {
      console.log(req.user.username, "trying to peek room", req.body.room)
      res.status(404).send("No peeking please.")
    }

    // Real searching msg now.
    Message.find({
      roomID: req.body.room,
      text: new RegExp(req.body.query, "i")
    }, function(err, msgs) {
      if (err) {
        console.log("Search message error", err);
        res.status(500).send("Search msg error")
      }
      //console.log(msgs);
      res.json(msgs);
    });
  });
})

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
