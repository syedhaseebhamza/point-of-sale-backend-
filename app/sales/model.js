const mongoose = require("mongoose");

const salesSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  orderdetails: [
    {
      productName: {
        type: String,
        required: true,
      },
      productQuantity: {
        type: Number,
        required: true,
      },
      totalPrice: {
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
            required: true,
          },

        },
      ],
      isDeleted: {
        type: Boolean,
        default: false,
      },
    },
    
  ],
  isDeleted: {
    type: Boolean,
    default: false,
  },
});

const Sales = mongoose.model("Sales", salesSchema);
module.exports = Sales;
