const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema(
  {
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Categories",
    },
    categoryName: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    retailPrice: {
      type: Number,
      required: false,
    },
    image: {
      type: String,
      default: null,
    },
    public_id: {
      type: String,
      default:null,
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
    createdBy: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

const Items = mongoose.model("Item", itemSchema);
module.exports = Items;
