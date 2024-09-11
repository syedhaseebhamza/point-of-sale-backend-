const express = require("express");
const router = express.Router();
const authenticateToken = require("../../middleware/authMiddleware");
const upload = require("../../middleware/multer");
const {
  handleAddItems,
  handleGetItems,
  deleteItem,
  handleUpdateItem,
} = require("./controller");

router.post("/create/item", authenticateToken,upload, handleAddItems);
router.delete("/delete/item/:id", authenticateToken, deleteItem);
router.get("/all/items", authenticateToken,upload, handleGetItems);
router.put("/update/item/:id", authenticateToken,upload, handleUpdateItem);

module.exports = router;
