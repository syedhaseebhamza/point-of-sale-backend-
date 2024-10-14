const express = require("express");
const authenticateToken = require("../../middleware/authMiddleware");
const { handlePlaceOrder,handelGetAllDraftOrders,handelGetAllOrders, handleUpdateOrder, handleDeleteOrder } = require("./controller");

const router = express.Router();

router.post("/place/order", authenticateToken, handlePlaceOrder);
router.get("/all/order", authenticateToken, handelGetAllOrders);
router.get("/all/draft/order", authenticateToken, handelGetAllDraftOrders);
router.put("/update/order/:id", authenticateToken, handleUpdateOrder);
router.delete("/delete/order/:id", authenticateToken, handleDeleteOrder);


module.exports = router;
