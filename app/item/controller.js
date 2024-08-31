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
    const existingItem = await Items.findOne({
      name,
      isDeleted: false,
    });
    if (existingItem) {
      return res
        .status(400)
        .json({ message: "Item with this name already exists" });
    }

    const softDeletedItem = await Items.findOne({
      name,
      isDeleted: true,
    });
    if (softDeletedItem) {
      softDeletedItem.isDeleted = false;
      softDeletedItem.categoryName = categoryName;
      softDeletedItem.retailPrice = retailPrice;
      softDeletedItem.variants = variants;
      await softDeletedItem.save();

      return res
        .status(200)
        .json({ message: "Item restored successfully", item: softDeletedItem });
    }

    const newItem = new Items({
      categoryName,
      name,
      retailPrice,
      variants,
    });

    await newItem.save();
    res.status(200).json({ message: "Item created successfully", newItem });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
}

async function handleGetItems(req, res) {
  try {
    const items = await Items.find({ isDeleted: false });

    const filteredItems = items.map((item) => {
      const filteredVariants = item.variants.filter(
        (variant) => !variant.isDeleted
      );

      return {
        ...item.toObject(),
        variants: filteredVariants,
      };
    });
    res
      .status(200)
      .json({ message: "Items retrieved successfully", items: filteredItems });
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
    const deletedItem = await Items.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { new: true }
    );
    if (!deletedItem) {
      return res.status(404).json({ message: `Item with ID ${id} not found` });
    }
    res
      .status(200)
      .json({
        message: `Item with ID ${id} deleted successfully`,
        deletedItem,
      });
  } catch (error) {
    res.status(500).json({ message: `Failed to delete Item with ID ${id}` });
  }
}

async function handleUpdateItem(req, res) {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid ID" });
  }
  const { categoryName, name, retailPrice, variants } = req.body;
  if (
    !categoryName &&
    !name &&
    !retailPrice &&
    (!variants || !Array.isArray(variants) || variants.length === 0)
  ) {
    return res.status(400).json({
      message: "At least one field must be provided for an update",
    });
  }

  try {
    const item = await Items.findById(id);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }
    if (categoryName) item.categoryName = categoryName;
    if (name) item.name = name;
    if (retailPrice) item.retailPrice = retailPrice;

    if (variants && Array.isArray(variants) && variants.length > 0) {
      for (const variant of variants) {
        const existingVariant = item.variants.find(
          (v) => v.size === variant.size
        );

        if (existingVariant) {
          existingVariant.price = variant.price;
          existingVariant.isDeleted = false; 
        } else {
          item.variants.push({
            size: variant.size,
            price: variant.price,
          });
        }
      }
      item.variants = item.variants.map((v) => {
        if (!variants.find((variant) => variant.size === v.size)) {
          v.isDeleted = true;
        }
        return v;
      });
    }

    await item.save();
    res.status(200).json({ message: "Item updated successfully", item });
  } catch (error) {
    res
      .status(500)
      .json({ message: `Failed to update Item with ID ${id}`, error });
  }
}

module.exports = {
  handleAddItems,
  handleGetItems,
  deleteItem,
  handleUpdateItem,
};
