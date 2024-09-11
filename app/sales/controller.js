const Sales = require("./model");
const mongoose = require("mongoose");

async function placeOrder(req, res) {
  const { productId, categoryId } = req.query;

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return res.status(400).json({ message: "Invalid ProductId" });
  }
  if (!mongoose.Types.ObjectId.isValid(categoryId)) {
    return res.status(400).json({ message: "Invalid CategoryId" });
  }

  const { orderdetails, totalPrice } = req.body;

  if (
    !orderdetails ||
    !Array.isArray(orderdetails) ||
    orderdetails.length === 0
  ) {
    return res.status(400).json({ message: "Invalid or empty orderdetails" });
  }

  if (typeof totalPrice !== "number") {
    return res.status(400).json({ message: "TotalPrice must be a number" });
  }
  if (totalPrice == null) {
    return res.status(400).json({ message: "TotalPrice is required" });
  }

  for (let i = 0; i < orderdetails.length; i++) {
    const detail = orderdetails[i];

    if (!detail.productName) {
      return res
        .status(400)
        .json({ message: `ProductName is required for item ${i + 1}` });
    }

    if (typeof detail.productQuantity !== "number") {
      return res.status(400).json({
        message: `ProductQuantity must be a number for item ${i + 1}`,
      });
    }
  }

  try {
    const newOrder = new Sales({
      productId,
      categoryId,
      orderdetails,
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
