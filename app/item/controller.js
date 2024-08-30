const Items = require("./model");
const mongoose = require("mongoose");

async function handleAddItems(req, res) {
  const { categoryId } = req.query;

  if (!mongoose.Types.ObjectId.isValid(categoryId)) {
    return res.status(400).json({ message: "Invalid ID" });
  }

  const { categoryName, name, retailPrice, variants } = req.body;
  if (
    !categoryName ||
    !name ||
    !variants ||
    !Array.isArray(variants) ||
    variants.length === 0
  ) {
    return res.status(400).json({
      message:
        "categoryName, name, and variants are required, and variants must be a non-empty array",
    });
  }

  for (const variant of variants) {
    if (!variant.size || !variant.price) {
      return res.status(400).json({
        message: "Each variant must have a non-empty size and price",
      });
    }
  }

  try {
    const existingItemWithSameName = await Items.findOne({
      name,
    });
    if (existingItemWithSameName) {
      return res
        .status(400)
        .json({ message: "Item with this  name already exists" });
    }

    const newItem = new Items({
      _id: categoryId,
      categoryName,
      name,
      retailPrice,
      variants,
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

async function deleteItem(req, res) {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid ID" });
  }
  try {
    const deleteExistingItem = await Items.findByIdAndDelete(id);
    if (!deleteExistingItem) {
      return res.status(404).json({ message: `Item with ID ${id} not found` });
    }
    res
      .status(200)
      .json({ message: `Item with ID ${id} deleted successfully` });
  } catch (error) {
    res.status(500).json({ message: `Failed to delete Item with ID ${id}` });
  }
}

module.exports = { handleAddItems, handleGetItems, deleteItem };
