const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({
  categoryName: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  retailPrice: {
    type: Number,
    required: false,
  },
  variants: [
    {
      size: {
        type: String,
        required: true,
      },
      price: {
        type: Number,
        required: true,
      },
    },
  ],
});
const Items = mongoose.model("Item", itemSchema);
module.exports = Items;
