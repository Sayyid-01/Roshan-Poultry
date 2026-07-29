const mongoose = require('mongoose');
module.exports = mongoose.model('Gallery', new mongoose.Schema({ title:String, image:{type:String,required:true}, alt:String, isPublished:{type:Boolean,default:true} }, {timestamps:true}));
