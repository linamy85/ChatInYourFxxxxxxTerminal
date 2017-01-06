var express = require('express');
var router = express.Router();
var passport = require('passport');
var Account = require('../models/account');
var Chatroom = require('../models/chatroom');
var Message = require('../models/message');
var fse = require('fs-extra');
var path = require('path');

var exec = require('child_process').exec; 

router.get('/', function(req, res, next) {
  res.render('index', { title: 'ChatInTerminal', user: req.user, error: req.session.error });
});

router.get('/register', function(req, res) {
      res.render('register', {});
});

router.post('/register', function(req, res) {
  Account.register(
    new Account({ username : req.body.username }),
    req.body.password, 
    function(err, account) {
      if (err) {
        return res.render('register', { account : account, error: "ID existed" });
      }
      passport.authenticate('local')(req, res, function () {
        req.session.save(function (err) {
          if (err) {
            return next(err);
          }
          res.redirect('/');
        });
      });
    }
  ); // Account.register
});

router.get('/login', function(req, res) {
  res.render('login', { user : req.user  });
});

router.post('/login', passport.authenticate('local'), function(req, res) {
  console.log(req.user.username ,"logs in.")
  res.redirect('/');
});

router.get('/rooms', function(req, res) {
  console.log("User ", req.user.username, "finds own rooms")
  Chatroom.find({ users: req.user.username }, function(err, rooms) {
    if (err) {
      res.status(500)
      return console.log("Chatroom loading error:", err)
    }
    res.send(rooms)
  });
});

// req.body ::
//    users: target user that should be with req.user to create room.
//    roomid: chat room name.
router.post('/rooms/new', function(req, res) {
  console.log("hwwwwwwww ", req.user, "->", req.body)
  req.body.users.push(req.user.username);

  Account.find({'username': {$in: req.body.users}}, function(err, users) {
    if (err) {
      res.status(500)
      return console.log("Error loading target users:", err)
    }
    // Only username is needed.
    users = users.map(x => x.username)

    console.log("Targets:", users)
    var room = new Chatroom({
      users: users,
      name: req.body.roomid
    })
    room.save(function(err) {
      if (err) {
        //res.status(500)
        return console.log("Error creating chatroom:", err)
      }
      res.json(room)
    })
  })
});


router.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/');
});

router.get('/ping', function(req, res){
  res.status(200).send("pong!");
});

router.post('/payload', function(req, res) {
  console.log("Get new repo push:", req.body.head_commit)
  exec('/usr/bin/git pull origin master', function(err, stdout, stderr){
    if (err) return err;
    console.log(stdout);
    res.status(200).send("Updated!"+stdout)
  });
});

router.get('/file', function(req, res) {
    res.render('test');
});

router.post('/file', function(req, res) {
    console.log(req.files);
    var source = req.files.fileToUpload.file;
    var dest = global.appRoot + '/save/' + path.basename(source);
    fse.move(source, dest, function(err){
        if (err) return console.error(err)
        console.log("success!")
    });
    res.status(200).send('/uplaods' + path.basename(source));
});
    

module.exports = router;
