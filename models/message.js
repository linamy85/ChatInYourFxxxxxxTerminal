var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Message = new Schema({
  roomID: String,
  sender: String,
  text: String,
  sticker: {
    type: String,
    default: ""
  }
},{ 
  timestamps: { 
    createdAt: 'created_at'  
  }  
});

module.exports = mongoose.model('Message', Message);
