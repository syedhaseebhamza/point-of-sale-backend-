const express = require("express");
const authenticateToken = require("../../middleware/authMiddleware");
const { handlePlaceOrder } = require("./controller");

const router = express.Router();

router.post("/place/order", authenticateToken, handlePlaceOrder);

module.exports = router;
