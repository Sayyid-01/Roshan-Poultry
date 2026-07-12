const express = require("express");

const router = express.Router();


const {
    createProduct,
    getProducts,
    updateProduct,
    deleteProduct,
    updateStock

} = require("../controllers/product.controller");



router.post(
    "/",
    createProduct
);


router.get(
    "/",
    getProducts
);



router.put(
    "/:id",
    updateProduct
);



router.delete(
    "/:id",
    deleteProduct
);



router.patch(
    "/:id/stock",
    updateStock
);



module.exports = router;