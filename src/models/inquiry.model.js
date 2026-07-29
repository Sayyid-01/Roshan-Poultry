const mongoose = require('mongoose');
module.exports = mongoose.model('Inquiry', new mongoose.Schema({ name:{type:String,required:true}, email:String, phone:String, message:{type:String,required:true}, status:{type:String,enum:['NEW','CONTACTED','CLOSED'],default:'NEW'} }, {timestamps:true}));
