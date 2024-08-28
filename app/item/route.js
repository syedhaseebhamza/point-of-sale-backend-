const express = require("express");
const router = express.Router();
const authenticateToken = require("../../middleware/authMiddleware");
const { handleAddItems, handleGetItems } = require("./controller");

router.post("/add/item/:id", authenticateToken, handleAddItems);
router.get("/all/items", authenticateToken, handleGetItems);

module.exports = router;
