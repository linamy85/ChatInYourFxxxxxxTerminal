var express = require('express');
var router = express.Router();
var passport = require('passport');
var Account = require('../models/account');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'CN2016', user: req.user, error: req.session.error });
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
  console.log(req.user ,"logs in.")
  res.redirect('/');
});

router.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/');
});

router.get('/ping', function(req, res){
  res.status(200).send("pong!");
});


module.exports = router;
