const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: {
    required: true,
    type: String,
  },
  password: {
    type: String,
    required: true,
  },
});

const User = mongoose.model("user", UserSchema);
module.exports = User;
