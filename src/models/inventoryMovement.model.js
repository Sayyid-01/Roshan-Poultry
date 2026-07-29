const mongoose = require("mongoose");

const inventoryMovementSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  productName: { type: String, required: true },
  type: { type: String, enum: ["IN", "OUT", "ADJUSTMENT"], required: true },
  quantity: { type: Number, required: true },
  previousStock: { type: Number, required: true },
  currentStock: { type: Number, required: true },
  note: { type: String, default: "" },
}, { timestamps: true });

module.exports = mongoose.model("InventoryMovement", inventoryMovementSchema);
