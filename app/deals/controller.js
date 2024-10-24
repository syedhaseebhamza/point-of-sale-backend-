const Deals = require("./model");
const mongoose = require("mongoose");

// Handle to Add Deals
async function handleAddDeals(req, res) {
  const { categoryId, categoryName, name, retailPrice, products } = req.body;
  const user = req.user;
  const createdBy = user.userId;

  if (!mongoose.Types.ObjectId.isValid(categoryId)) {
    return res.status(400).json({ message: "Invalid Category ID" });
  }

  let parsedProducts;
  try {
    parsedProducts = JSON.parse(products);
  } catch (error) {
    return res.status(400).json({ message: "Invalid products format" });
  }

  if (
    !categoryName ||
    !name ||
    !parsedProducts ||
    !Array.isArray(parsedProducts) ||
    parsedProducts.length === 0
  ) {
    return res.status(400).json({
      message:
        "categoryName, name, and products are required, and products must be a non-empty array",
    });
  }

  for (const product of parsedProducts) {
    if (!product.productId || !product.productQuantity || !product.salePrice) {
      return res.status(400).json({
        message:
          "Each product must have productId, productQuantity, and salePrice",
      });
    }
  }

  try {
    const existingDeal = await Deals.findOne({
      name,
      isDeleted: false,
      createdBy,
    });

    if (existingDeal) {
      return res
        .status(400)
        .json({ message: "Deal with this name already exists" });
    }

    const softDeletedDeal = await Deals.findOne({
      name,
      isDeleted: true,
    });

    const totalPrice = parsedProducts.reduce((total, product) => {
      return total + product.salePrice * product.productQuantity;
    }, 0);

    if (softDeletedDeal) {
      softDeletedDeal.isDeleted = false;
      softDeletedDeal.categoryName = categoryName;
      softDeletedDeal.retailPrice = retailPrice;
      softDeletedDeal.products = parsedProducts;
      softDeletedDeal.totalPrice = totalPrice;
      softDeletedDeal.categoryId = categoryId;
      softDeletedDeal.image = req.file ? req.file.path : softDeletedDeal.image;
      softDeletedDeal.public_id = req.file
        ? req.file.filename
        : softDeletedDeal.public_id;
      await softDeletedDeal.save();

      return res
        .status(200)
        .json({ message: "Deal restored successfully", deal: softDeletedDeal });
    }

    const newDeal = new Deals({
      categoryId,
      categoryName,
      name,
      retailPrice,
      products: parsedProducts,
      createdBy,
      totalPrice,
      image: req.file ? req.file.path : null,
      public_id: req.file ? req.file.filename : null,
    });

    await newDeal.save();
    res.status(200).json({ message: "Deal created successfully", newDeal });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
}

// Handle to Get Deals
async function handleGetDeals(req, res) {
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

    const deals = await Deals.find(query).populate("categoryId", "name");

    const filteredDeals = deals.map((deal) => {
      const filteredProducts = deal.products.filter(
        (product) => !product.isDeleted
      );
      const categoryId = deal.categoryId ? deal.categoryId._id : null;
      const categoryName = deal.categoryId ? deal.categoryId.name : null;
      return {
        _id: deal._id,
        categoryId,
        categoryName,
        name: deal.name,
        retailPrice: deal.retailPrice,
        image: deal.image,
        totalPrice: deal.totalPrice,
        products: filteredProducts,
      };
    });

    res.status(200).json({
      message: categoryId
        ? ` ${
            deals.length === 0
              ? "No Deal Found for this category ID"
              : "Deals retrieved successfully for the given category ID"
          }`
        : "Deals retrieved successfully",
      deals: filteredDeals,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
}

// Handle to Delete Deals
async function deleteDeals(req, res) {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid ID" });
  }

  try {
    const deletedDeal = await Deals.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { new: true }
    );

    if (!deletedDeal) {
      return res.status(404).json({ message: `Deal with ID ${id} not found` });
    }

    res.status(200).json({
      message: `Deal with ID ${id} deleted successfully`,
      deletedDeal,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: `Failed to delete Deal with ID ${id}`, error });
  }
}

// Handle to Update Deals
async function handleUpdateDeals(req, res) {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid ID" });
  }

  const { categoryName, categoryId, name, retailPrice, products } = req.body;

  let parsedProducts;
  try {
    parsedProducts = JSON.parse(products);
  } catch (error) {
    return res.status(400).json({ message: "Invalid products format" });
  }

  if (
    !categoryName &&
    !categoryId &&
    !name &&
    !retailPrice &&
    (!parsedProducts ||
      !Array.isArray(parsedProducts) ||
      parsedProducts.length === 0)
  ) {
    return res.status(400).json({
      message: "At least one field must be provided for an update",
    });
  }

  try {
    const deal = await Deals.findById(id);

    if (!deal) {
      return res.status(404).json({ message: "Deal not found" });
    }

    if (categoryName) deal.categoryName = categoryName;
    if (categoryId) deal.categoryId = categoryId;
    if (name) deal.name = name;
    if (retailPrice) deal.retailPrice = retailPrice;
    if (
      parsedProducts &&
      Array.isArray(parsedProducts) &&
      parsedProducts.length > 0
    ) {
      deal.products = parsedProducts.map((product) => {
        const existingProduct = deal.products.find(
          (p) => p.productId === product.productId
        );

        return {
          productId: product.productId,
          productQuantity: product.productQuantity,
          salePrice:
            product.salePrice !== undefined
              ? product.salePrice
              : existingProduct.salePrice,
        };
      });

      deal.totalPrice = deal.products.reduce((total, product) => {
        return total + product.salePrice * product.productQuantity;
      }, 0);
    }

    deal.image = req.file ? req.file.path : deal.image;
    deal.public_id = req.file ? req.file.filename : deal.public_id;

    await deal.save();

    res.status(200).json({ message: "Deal updated successfully", deal });
  } catch (error) {
    console.error("Update error:", error);
    res
      .status(500)
      .json({ message: `Failed to update Deal with ID ${id}`, error });
  }
}

module.exports = {
  handleAddDeals,
  handleGetDeals,
  deleteDeals,
  handleUpdateDeals,
};
