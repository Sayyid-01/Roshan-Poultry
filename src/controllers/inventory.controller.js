const InventoryMovement = require("../models/inventoryMovement.model");
const Product = require("../models/product.model");

exports.getMovements = async (_req, res) => {
  try {
    const movements = await InventoryMovement.find().sort({ createdAt: -1 }).limit(100);
    res.json({ success: true, movements });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.adjustStock = async (req, res) => {
  try {
    const { quantity, type, note = "" } = req.body;
    const parsedQuantity = Number(quantity);
    if (!Number.isFinite(parsedQuantity) || parsedQuantity <= 0 || !["IN", "OUT", "ADJUSTMENT"].includes(type)) {
      return res.status(400).json({ success: false, message: "Provide a valid stock adjustment" });
    }
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    const previousStock = product.stock;
    const nextStock = type === "OUT" ? previousStock - parsedQuantity : previousStock + parsedQuantity;
    if (nextStock < 0) return res.status(400).json({ success: false, message: "Stock cannot go below zero" });
    product.stock = nextStock;
    await product.save();
    const movement = await InventoryMovement.create({
      product: product._id, productName: product.name, type, quantity: parsedQuantity,
      previousStock, currentStock: nextStock, note,
    });
    res.json({ success: true, message: "Inventory updated", product, movement });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
