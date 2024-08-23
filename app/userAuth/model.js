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
    default: "superadmin",
  },
});

const User = mongoose.model("user", UserSchema);
module.exports = User;
