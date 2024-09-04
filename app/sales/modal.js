const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Categories",
  },
  categoryName: {
    type: String,
    required: true,
    unique: false,
  },
  name: {
    type: String,
    required: true,
    unique: true,
  },
  retailPrice: {
    type: Number,
    required: false,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
});
const Items = mongoose.model("Item", itemSchema);
module.exports = Items;
