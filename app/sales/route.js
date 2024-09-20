const express = require("express");
const authenticateToken = require("../../middleware/authMiddleware");
const { handlePlaceOrder,handelGetAllOrders } = require("./controller");

const router = express.Router();

router.post("/place/order", authenticateToken, handlePlaceOrder);
router.get("/all/order", authenticateToken, handelGetAllOrders);


module.exports = router;
