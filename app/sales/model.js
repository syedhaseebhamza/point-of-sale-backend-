const mongoose = require("mongoose");

const salesSchema = new mongoose.Schema({
  categoryData: [
    {
      categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Categories",
      },
    },
  ],

  productData: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Item",
      },
      productName: {
        type: String,
        required: true,
      },
      productQuantity: {
        type: Number,
        required: true,
      },

      variants: {
        type: String,
        required: true,
      },

      isDeleted: {
        type: Boolean,
        default: false,
      },
    },
  ],
  discount: {
    type: Number,
    required: false,
  },
  totalPrice: {
    type: Number,
    required: true,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  isDraft: {
    type: Boolean,
    default: false,
  },
});

const Sales = mongoose.model("Sales", salesSchema);
module.exports = Sales;
