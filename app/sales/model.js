const mongoose = require("mongoose");

const salesSchema = new mongoose.Schema({
  categoryData: [
    {
      categoryName: {
        type: String,
        required: true,
      },
      categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
      },
    },
  ],
  productData: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
      },
      productName: {
        type: String,
        required: true,
      },
      productQuantity: {
        type: Number,
        required: true,
      },
      productDiscount: {
        type: Number,
        default: null,
      },
      variants: [
        {
          size: {
            type: String,
            required: false,
          },
        },
      ],
      isDeleted: {
        type: Boolean,
        default: false,
      },
    },
  ],
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
