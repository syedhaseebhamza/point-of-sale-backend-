const Items = require("./model");
const mongoose = require("mongoose");

// Handle to Add Items
async function handleAddItems(req, res) {
  const { categoryId } = req.query;

  if (!mongoose.Types.ObjectId.isValid(categoryId)) {
    return res.status(400).json({ message: "Invalid ID" });
  }

  const { categoryName, name, retailPrice } = req.body;
  let { variants } = req.body;
  const user = req.user;
  const created = user.userId;

  if (typeof variants === "string") {
    try {
      variants = JSON.parse(variants);
    } catch (error) {
      return res
        .status(400)
        .json({ message: "Invalid JSON format for variants" });
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
      createdBy: user.userId,
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
      softDeletedItem.image = req.file ? req.file.path : softDeletedItem.image;
      softDeletedItem.public_id = req.file
        ? req.file.filename
        : softDeletedItem.public_id;
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
      image: req.file ? req.file.path : null,
      public_id: req.file ? req.file.filename : null,
      variants,
      createdBy: created,
    });

    await newItem.save();
    res.status(200).json({ message: "Item created successfully", newItem });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
}

// Handle to Get Items
async function handleGetItems(req, res) {
  const { categoryId } = req.query;
  const user = req.user;

  if (categoryId && !mongoose.Types.ObjectId.isValid(categoryId)) {
    return res.status(400).json({ message: "Invalid Category ID" });
  }

  try {
    const query = {
      isDeleted: false,
      createdBy: user.userId,
    };

    if (categoryId) {
      query.categoryId = categoryId;
    }

    const items = await Items.find(query).populate("categoryId", "name");

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

    res.status(200).json({
      message: categoryId
        ? ` ${
            items.length === 0
              ? "No Item Found form this categoryID"
              : "Items retrieved successfully for the given categoryId"
          }`
        : "Items retrieved successfully",
      items: filteredItems,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
}

// Handle to Delete Item
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

// Handle to Update Item
async function handleUpdateItem(req, res) {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid ID" });
  }

  const { categoryId, categoryName, name, retailPrice, variants } = req.body;

  let parsedVariants = variants;
  if (typeof variants === "string") {
    try {
      parsedVariants = JSON.parse(variants);
    } catch (error) {
      return res
        .status(400)
        .json({ message: "Invalid JSON format for variants" });
    }
  }

  const retailPriceNumber =
    retailPrice !== "null" && !isNaN(Number(retailPrice))
      ? Number(retailPrice)
      : null;

  if (
    !categoryName &&
    !categoryId &&
    !name &&
    retailPriceNumber === null &&
    (!parsedVariants ||
      !Array.isArray(parsedVariants) ||
      parsedVariants.length === 0)
  ) {
    return res
      .status(400)
      .json({ message: "At least one field must be provided for an update" });
  }

  try {
    const item = await Items.findById(id);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    if (categoryName) {
      item.categoryName = categoryName;
    }

    if (categoryId) {
      item.categoryId = categoryId;
    }

    if (name) {
      item.name = name;
    }
    if (retailPriceNumber !== null) {
      item.retailPrice = retailPriceNumber;
    }

    if (Array.isArray(parsedVariants) && parsedVariants.length > 0) {
      parsedVariants.forEach((variant) => {
        const existingVariant = item.variants.find(
          (v) => v.size === variant.size
        );
        if (existingVariant) {
          existingVariant.price = Number(variant.price);
          existingVariant.isDeleted = false;
        } else {
          item.variants.push({
            size: variant.size,
            price: Number(variant.price),
            isDeleted: false,
          });
        }
      });

      item.variants = item.variants.map((v) => {
        if (!parsedVariants.find((variant) => variant.size === v.size)) {
          v.isDeleted = true;
        }
        return v;
      });
    }

    item.image = req.file ? req.file.path : item.image;
    item.public_id = req.file ? req.file.filename : item.public_id;

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
