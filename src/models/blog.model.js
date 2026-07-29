const mongoose = require('mongoose');
module.exports = mongoose.model('Blog', new mongoose.Schema({ title:{type:String,required:true}, slug:{type:String,unique:true}, excerpt:String, content:String, coverImage:String, isPublished:{type:Boolean,default:true}, publishedAt:Date }, {timestamps:true}));
