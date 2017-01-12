var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var debug = require('debug')('chatinyourfxxxxxxterminal:server');
var http = require('http');

var index = require('./routes/index');
var users = require('./routes/users');
var message = require('./routes/message.js');

var mongoose = require('mongoose');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var bb = require('express-busboy');

var app = express();


bb.extend(app, {
    upload: true,
    path: path.join(__dirname, 'temp'),
    allowedPath: /^\/file$/
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());
app.use(session({
    secret: 'keyboard cat'
    //resave: false,
    //saveUninitialized: true,
}));
app.use(passport.initialize());
app.use(passport.session());

app.use('/', index);
app.use('/users', users);
app.use('/message', message);

app.use('/uploads', express.static('save'));

// passport config
var Account = require('./models/account');
passport.use(new LocalStrategy(Account.authenticate()));
passport.serializeUser(Account.serializeUser());
passport.deserializeUser(Account.deserializeUser());

// mongoose
mongoose.connect('mongodb://localhost/cn2016');


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


///////////// Creates HTTP server & bind with socket.io //////////

var server = http.createServer(app);

var io = require('socket.io').listen(server);

///////////// Socket.io ///////////////
var Message = require('./models/message');
var Chatroom = require('./models/chatroom');

var online = {}

io.sockets.on('connection', function(socket) {

  // User sends messages.
  socket.on('chat message', function(text, counter) {
    console.log(socket.username, "sends #", counter, ":", text, "to", socket.room);
    // TODO: store to DB (need protocol like counter??)
    var msg = new Message({
      roomID: socket.room,
      sender: socket.username,
      text: text,
      sticker: ""
    })
    msg.save(function(err, msg) {
      if (err) {
        socket.emit("Update failed", msg);
        return console.log("Save new message: ", err);
      }
      console.log("New message:", msg)
      socket.broadcast.to(socket.room).emit(
        "chat message", socket.username, text, msg.id
      );
      socket.emit("Message id", counter, msg.id);
    })
  });
  
  socket.on('join room', function(roomid) {
    socket.room = roomid;
    socket.join(roomid);
    Chatroom.findById(roomid, function(err, obj) {
      if (err) {
        console.log("Error finding room meta:", roomid)
        socket.emit("Room meta error");
      }
      var status = {}
      console.log("obj", obj)
      obj.users.forEach(function(user, id, arr) {
        if (user in online) {
          status[user] = true
        } else {
          status[user] = false
        }
      })
      socket.emit("Room meta", status);
      socket.broadcast.to(roomid).emit("Online", socket.username)
    })
  });
  
  socket.on('set name', function(name) {
    socket.username = name;
    // User shows online
    online[socket.username] = true
  })

  socket.on('delete msg', function(id) {
    Message.findByIdAndRemove(id, function(err, doc) {
      if (err) {
        console.log("Error removing id", id);
        return
      }
      console.log("Delete response:", doc);
      io.in(socket.room).emit("delete msg confirm", id);
    })
  })

  socket.on('disconnect', function() {
    socket.broadcast.to(socket.room).emit("Offline", socket.username);
    socket.leave(socket.room);
    delete online[socket.username];
  })
});



////////////// Port binding /////////////

var port = normalizePort(process.env.PORT || '7878');
app.set('port', port);

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  console.log('Listening on ' + bind);
}

global.appRoot = path.resolve(__dirname);

