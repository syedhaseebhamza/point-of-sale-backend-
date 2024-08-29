const express = require("express");
const router = express.Router();
const authenticateToken = require("../../middleware/authMiddleware");
const { handleAddItems, handleGetItems } = require("./controller");

router.post("/create/item", authenticateToken, handleAddItems);
router.get("/all/items", authenticateToken, handleGetItems);

module.exports = router;
