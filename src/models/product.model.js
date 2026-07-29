const mongoose = require("mongoose");


const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        category: {
            type: String,
            required: true
        },

        unit: {
            type: String,
            enum: ["KG", "PIECE"],
            default: "KG"
        },

        price: {
            type: Number,
            required: true,
            min: 0
        },

        stock: {
            type: Number,
            required: true,
            default: 0,
            min: 0
        },
        minimumStock: {
            type: Number,
            default: 10,
            min: 0
        },

        sku: {
            type: String,
            trim: true,
            uppercase: true
        },

        description: {
            type: String
        },

        image: {
            type: String,
            default:
                "https://media.istockphoto.com/id/1342480600/photo/free-range-healthy-brown-organic-chickens-and-a-white-rooster-on-a-green-meadow.jpg?s=612x612&w=0&k=20&c=HWwPGRkHpEnObkcsMzopcmXorwHD0PS7NQ1EiA8K53c=",
        },

        isActive: {
            type: Boolean,
            default: true
        }


    },
    {
        timestamps: true
    }
);


module.exports = mongoose.model(
    "Product",
    productSchema
);
