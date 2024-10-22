const mongoose = require("mongoose");

const addNewUserScheme = new mongoose.Schema(
  {
    username: {
      required: true,
      type: String,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      unique: true,
    },
    role: {
      type: String,
      required: true,
    },
    discount: {
      type: Number,
      default: 0,
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

const newUser = mongoose.model("newUser", addNewUserScheme);
module.exports = newUser;
