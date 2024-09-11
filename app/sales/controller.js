const Sales = require("./model");
const mongoose = require("mongoose");

async function placeOrder(req, res) {
  const { productId, categoryId } = req.query;
  if (!mongoose.Types.ObjectId.isValid(categoryId, productId)) {
    return res.status(400).json({ message: "Invalid ID" });
  }
  const {variants,quantity,totalPrice,discount} = req.body;
  if (

    !variants ||
    !Array.isArray(variants) ||
    variants.length === 0 ||
    !quantity||
    !totalPrice||
    !discount
  ) {
    return res.status(400).json({
      message:
        "variants, quantity, totalPrice, and discount are required, and variants must be a non-empty array",
    });
  }
  for (const variant of variants) {
    if (!variant.size) {
      return res.status(400).json({
        message: "Each variant must have a non-empty size",
      });
    }
  }
}

module.exports = {
  placeOrder,
};
