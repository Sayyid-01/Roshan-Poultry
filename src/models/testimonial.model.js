const mongoose = require('mongoose');
module.exports = mongoose.model('Testimonial', new mongoose.Schema({ name:{type:String,required:true}, role:{type:String,default:'Customer'}, quote:{type:String,required:true}, rating:{type:Number,default:5,min:1,max:5}, isPublished:{type:Boolean,default:true} }, {timestamps:true}));
