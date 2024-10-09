const Sales = require("./model");
const mongoose = require("mongoose");
const Categories = require("../catagary/model");
const Items = require("../item/model"); // Make sure to import your Item model

async function handlePlaceOrder(req, res) {
  const user = await req.user;
  const { categoryData, productData, totalPrice, discount, isDraft } = req.body;

  if (
    !categoryData ||
    !Array.isArray(categoryData) ||
    categoryData.length === 0
  ) {
    return res.status(400).json({ message: "Invalid or empty categoryData" });
  }

  const categoryIds = categoryData?.map((category) => category.categoryId);
  const invalidCategoryIds = categoryIds.filter(
    (id) => !mongoose.Types.ObjectId.isValid(id)
  );

  if (invalidCategoryIds.length > 0) {
    return res.status(400).json({
      message: `Invalid CategoryId(s): ${invalidCategoryIds.join(", ")}`,
    });
  }

  const existingCategories = await Categories.find({
    _id: { $in: categoryIds },
  });

  const existingCategoryIds = existingCategories.map((category) =>
    category._id.toString()
  );
  const notFoundCategoryIds = categoryIds.filter(
    (id) => !existingCategoryIds.includes(id)
  );

  if (notFoundCategoryIds.length > 0) {
    return res.status(404).json({
      message: `CategoryId(s) not found: ${notFoundCategoryIds.join(", ")}`,
    });
  }

  const transformedCategoryData = existingCategories.map((category) => ({
    categoryId: category._id,
    categoryName: category.name,
  }));

  if (!productData || !Array.isArray(productData) || productData.length === 0) {
    return res.status(400).json({ message: "Invalid or empty productData" });
  }

  const productIds = productData.map((product) => product.productId);
  const invalidProductIds = productIds.filter(
    (id) => !mongoose.Types.ObjectId.isValid(id)
  );

  if (invalidProductIds.length > 0) {
    return res.status(400).json({
      message: `Invalid ProductId(s): ${invalidProductIds.join(", ")}`,
    });
  }

  const existingItems = await Items.find({
    _id: { $in: productIds },
  });

  const existingItemIds = existingItems.map((item) => item._id.toString());
  const notFoundProductIds = productIds.filter(
    (id) => !existingItemIds.includes(id)
  );

  if (notFoundProductIds.length > 0) {
    return res.status(404).json({
      message: `ProductId(s) not found: ${notFoundProductIds.join(", ")}`,
    });
  }

  for (let i = 0; i < productData.length; i++) {
    const product = productData[i];

    if (!product.productName) {
      return res
        .status(400)
        .json({ message: `ProductName is required for product ${i + 1}` });
    }

    if (!product.productPrice) {
      return res
        .status(400)
        .json({ message: `ProductPrice is required for product ${i + 1}` });
    }

    if (typeof product.productQuantity !== "number") {
      return res.status(400).json({
        message: `ProductQuantity must be a number for product ${i + 1}`,
      });
    }
    if (!product.variants) {
      return res
        .status(400)
        .json({ message: `ProductName is required for product ${i + 1}` });
    }
  }

  if (typeof totalPrice !== "number" || totalPrice == null) {
    return res
      .status(400)
      .json({ message: "TotalPrice must be a valid number" });
  }

  if (typeof discount !== "number") {
    return res.status(400).json({ message: "Discount must be a number" });
  }

  try {
    const newOrder = new Sales({
      categoryData: transformedCategoryData,
      productData,
      totalPrice,
      discount,
      isDraft,
      createdBy: user.userId
    });
    await newOrder.save();
    return res
      .status(201)
      .json({ message: "Order placed successfully", newOrder });
  } catch (error) {
    return res.status(500).json({ message: "Error placing order", error });
  }
}

async function handelGetAllOrders(req, res) {
  const { isDraft } = req.query;
  const user = await req.user;
  try {
    const query = isDraft ? { isDraft: true, isDeleted: false, createdBy: user.userId } : {
      isDeleted: false,
      createdBy: user.userId,
      isDraft: false
    };
    const orders = await Sales.find(query);
    return res
      .status(200)
      .json({ message: "Orders fetched successfully", orders });
  } catch (error) {
    return res.status(500).json({ message: "Error fetching orders", error });
  }
}

// Handle to Update the Order
async function handleUpdateOrder(req, res) {
  const { id } = req.params;

  try {
    const updatedSale = await Sales.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!updatedSale) {
      return res.status(404).json({ message: "Sale not found" });
    }

    res.status(200).json({ message: "Sale updated successfully", updatedSale });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
}

// Handle to Delete draft Order
async function handleDeleteOrder(req, res) {
  const { id } = req.params;
  try {
    const order = await Sales.findByIdAndUpdate(id,{isDeleted: true},{
      new: true,
      runValidators: true,
    });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    return res.status(200).json({ message: "Order deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Error deleting order", error });
  }
}

module.exports = {
  handlePlaceOrder,
  handelGetAllOrders,
  handleUpdateOrder,
  handleDeleteOrder,
};
