const Items = require("./model");
const mongoose = require("mongoose");

async function handleAddItems(req, res) {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid ID" });
  }

  const { categoryName, retailPrice, salePrice, discount, size } = req.body;
  if (!categoryName) {
    return res
      .status(400)
      .json({ message: "categoryName fields are required" });
  }
  if (!retailPrice) {
    return res.status(400).json({ message: "retailPrice fields are required" });
  }
  if (!salePrice) {
    return res.status(400).json({ message: "salePrice fields are required" });
  }
  if (!discount) {
    return res.status(400).json({ message: "discount fields are required" });
  }
  if (!size) {
    return res.status(400).json({ message: "size fields are required" });
  }

  try {
    const existingItem = await Items.findById(id);
    if (existingItem) {
      return res
        .status(400)
        .json({ message: "Item with this ID already exists" });
    }

    const existingItemWithSameCategoryName = await Items.findOne({
      categoryName,
    });
    if (existingItemWithSameCategoryName) {
      return res
        .status(400)
        .json({ message: "Item with this category name already exists" });
    }

    const newItem = new Items({
      _id: id,
      categoryName,
      retailPrice,
      salePrice,
      discount,
      size,
    });

    await newItem.save();
    res.status(200).json({ message: "Item created successfully", newItem });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
}

async function handleGetItems(req, res) {
  try {
    const items = await Items.find();
    res.status(200).json({ message: "Items retrieved successfully", items });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
}

module.exports = { handleAddItems, handleGetItems };
