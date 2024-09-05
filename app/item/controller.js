const Items = require("./model");
const mongoose = require("mongoose");
async function handleAddItems(req, res) {
  const { categoryId } = req.query;

  if (!mongoose.Types.ObjectId.isValid(categoryId)) {
    return res.status(400).json({ message: "Invalid ID" });
  }

  const { categoryName, name, retailPrice } = req.body;
  let { variants } = req.body;


  if (typeof variants === 'string') {
    try {
      variants = JSON.parse(variants);
    } catch (error) {
      return res.status(400).json({ message: "Invalid JSON format for variants" });
    }
  }

  if (
    !categoryName ||
    !name ||
    !variants ||
    
    !Array.isArray(variants) ||
    variants.length === 0
  ) {
    return res.status(400).json({
      message:
        "categoryName, name, image, and variants are required, and variants must be a non-empty array",
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
      softDeletedItem.categoryId = categoryId;
      await softDeletedItem.save();

      return res
        .status(200)
        .json({ message: "Item restored successfully", item: softDeletedItem });
    }

    const newItem = new Items({
      categoryId,
      categoryName,
      name,
      retailPrice,
      image: req.file
        ? `${req.protocol}://${req.get("host")}/public/${req.file.filename}`
        : null,
      variants,
    });

    await newItem.save();
    res.status(200).json({ message: "Item created successfully", newItem });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
}

async function handleGetItems(req, res) {
  const { categoryId } = req.query;

  if (categoryId && !mongoose.Types.ObjectId.isValid(categoryId)) {
    return res.status(400).json({ message: "Invalid Category ID" });
  }

  try {
    const query = {
      isDeleted: false,
    };

    if (categoryId) {
      query.categoryId = categoryId;
    }

    const items = await Items.find(query).populate("categoryId", "name");

    if (items.length === 0) {
      return res.status(404).json({
        message: categoryId
          ? "No items found for the given categoryId"
          : "No items found",
      });
    }

    const filteredItems = items.map((item) => {
      const filteredVariants = item.variants.filter(
        (variant) => !variant.isDeleted
      );
      const { _id: categoryId, name: categoryName } = item.categoryId;
      return {
        _id: item._id,
        categoryId,
        categoryName,
        name: item.name,
        image: item.image,
        retailPrice: item.retailPrice,
        variants: filteredVariants,
      };
    });

    const response = categoryId
      ? {
          items: filteredItems,
        }
      : { items: filteredItems };

    res.status(200).json({
      message: categoryId
        ? "Items retrieved successfully for the given categoryId"
        : "Items retrieved successfully",
      ...response,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
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
    res.status(200).json({
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
