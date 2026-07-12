const mongoose = require("mongoose");


const productSchema = new mongoose.Schema(
{
    name:{
        type:String,
        required:true,
        trim:true
    },

    category:{
        type:String,
        required:true
    },

    unit:{
        type:String,
        enum:["KG","PIECE"],
        default:"KG"
    },

    price:{
        type:Number,
        required:true,
        min:0
    },

    stock:{
        type:Number,
        required:true,
        default:0,
        min:0
    },

    description:{
        type:String
    },

    isActive:{
        type:Boolean,
        default:true
    }

},
{
    timestamps:true
}
);


module.exports = mongoose.model(
    "Product",
    productSchema
);
