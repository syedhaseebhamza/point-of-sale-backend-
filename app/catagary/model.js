const mongoose = require("mongoose");

const categoryModelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    default: null,
  },
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },
});

const Categories = mongoose.model("Categories", categoryModelSchema);

module.exports = Categories;
