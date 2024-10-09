const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
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
    enum: ['superadmin', 'cashier']
  },
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },
});

const User = mongoose.model("user", UserSchema);
module.exports = User;
