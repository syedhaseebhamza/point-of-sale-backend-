const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({
  categoryName: {
    type: String,
    required: true,
    unique: true,
  },
  retailPrice: {
    type: Number,
    required: true,
  },
  salePrice: {
    type: Number,
    required: true,
  },

  discount: {
    type: Number,
    required: true,
  },
  size: {
    type: String,
    required: true,
  },
});
const Items = mongoose.model("Item", itemSchema);
module.exports = Items;
