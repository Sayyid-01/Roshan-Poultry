const Product = require("../models/product.model");



// CREATE PRODUCT

exports.createProduct = async (req, res) => {

    try {

        const {
            name,
            category,
            unit,
            price,
            stock,
            description,
            image,
            minimumStock,
            sku
        } = req.body;


        const product = await Product.create({
            name,
            category,
            unit,
            price,
            stock,
            description,
            image,
            minimumStock,
            sku
        });


        res.status(201).json({
            success: true,
            message: "Product created successfully",
            product
        });


    } catch (error) {
        res.status(500).json({

            success: false,
            message: error.message
        });
    }
};




// GET ALL PRODUCTS


exports.getProducts = async (req, res) => {

    try {
        const products = await Product.find({
            isActive: true
        });
        res.json({

            success: true,
            products

        });
    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};




// UPDATE PRODUCT


exports.updateProduct = async (req, res) => {

    try {


        const product =
            await Product.findByIdAndUpdate(
                req.params.id,
                req.body,
                {
                    new: true
                }
            );


        res.json({

            success: true,
            message: "Product updated",
            product

        });


    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};




// DELETE PRODUCT


exports.deleteProduct = async (req, res) => {

    try {


        await Product.findByIdAndUpdate(
            req.params.id,
            {
                isActive: false
            }
        );


        res.json({

            success: true,
            message: "Product deleted"

        });


    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};




// STOCK UPDATE


exports.updateStock = async (req, res) => {

    try {


        const {
            quantity,
            type
        } = req.body;


        const product =
            await Product.findById(req.params.id);



        if (!product) {

            return res.status(404).json({
                message: "Product not found"
            });

        }

        if (type === "increase") {

            product.stock += quantity;

        }

        if (type === "decrease") {


            if (product.stock < quantity) {

                return res.status(400).json({
                    message: "Insufficient stock"
                });
            }
            product.stock -= quantity;
        }
        await product.save();

        res.json({
            success: true,
            message: "Stock updated",
            stock: product.stock
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};
