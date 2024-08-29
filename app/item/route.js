const express = require("express");
const router = express.Router();
const authenticateToken = require("../../middleware/authMiddleware");
const { handleAddItems, handleGetItems,deleteItem } = require("./controller");

router.post("/create/item", authenticateToken, handleAddItems);
router.delete("/delete/item/:id", authenticateToken, deleteItem);
router.get("/all/items", authenticateToken, handleGetItems);

module.exports = router;
