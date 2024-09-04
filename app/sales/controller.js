const Items = require("./model");
const mongoose = require("mongoose");
const Categories = require("../sales/modal");

async function handleGetItems(req, res) {
    const {id} = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }
  try {

  } catch (error) {
    res.status(500).json({ message: "Internal server error",error });
  }
}

module.exports = {
  handleGetItems,
};
