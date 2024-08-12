const mongoose = require("mongoose");

const addNewUserScheme = new mongoose.Schema({
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
    required: true,
    type: String,
  },
});

const newUser = mongoose.model("newUser", addNewUserScheme);
module.exports = newUser;
