const Sales = require("./model");
const mongoose = require("mongoose");
const Categories = require("../catagary/model");
const Items = require("../item/model"); // Make sure to import your Item model

async function handlePlaceOrder(req, res) {
  const { categoryData, productData, totalPrice, discount } = req.body;

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

    if (typeof product.productQuantity !== "number") {
      return res.status(400).json({
        message: `ProductQuantity must be a number for product ${i + 1}`,
      });
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
    });
    await newOrder.save();
    return res
      .status(201)
      .json({ message: "Order placed successfully", newOrder });
  } catch (error) {
    return res.status(500).json({ message: "Error placing order", error });
  }
}

module.exports = {
  handlePlaceOrder,
};
