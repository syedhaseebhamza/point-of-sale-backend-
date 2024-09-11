const Sales = require("./model");
const mongoose = require("mongoose");

async function placeOrder(req, res) {
  const { categoryData, productData, totalPrice } = req.body;

  if (
    !categoryData ||
    !Array.isArray(categoryData) ||
    categoryData.length === 0
  ) {
    return res.status(400).json({ message: "Invalid or empty categoryData" });
  }

  for (let i = 0; i < categoryData.length; i++) {
    const category = categoryData[i];

    if (!category.categoryName) {
      return res
        .status(400)
        .json({ message: `CategoryName is required for category ${i + 1}` });
    }

    if (!mongoose.Types.ObjectId.isValid(category.categoryId)) {
      return res
        .status(400)
        .json({ message: `Invalid CategoryId for category ${i + 1}` });
    }
  }

  if (!productData || !Array.isArray(productData) || productData.length === 0) {
    return res.status(400).json({ message: "Invalid or empty productData" });
  }

  for (let i = 0; i < productData.length; i++) {
    const product = productData[i];

    if (!mongoose.Types.ObjectId.isValid(product.productId)) {
      return res
        .status(400)
        .json({ message: `Invalid ProductId for product ${i + 1}` });
    }

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

  if (typeof totalPrice !== "number") {
    return res.status(400).json({ message: "TotalPrice must be a number" });
  }
  if (totalPrice == null) {
    return res.status(400).json({ message: "TotalPrice is required" });
  }

  try {
    const newOrder = new Sales({
      categoryData,
      productData,
      totalPrice,
    });

    await newOrder.save();
    return res
      .status(201)
      .json({ message: "Order placed successfully", order: newOrder });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error placing order", error: error.message });
  }
}

module.exports = {
  placeOrder,
};
