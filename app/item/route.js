const express = require("express");
const router = express.Router();
const authenticateToken = require("../../middleware/authMiddleware");
const authenticateRole = require("../../middleware/authRoleMiddleware");
const upload = require("../../middleware/multer");
const {
  handleAddItems,
  handleGetItems,
  deleteItem,
  handleUpdateItem,
} = require("./controller");

router.post("/create/item", authenticateToken, authenticateRole,upload , handleAddItems);
router.delete("/delete/item/:id", authenticateToken, authenticateRole , deleteItem);
router.get("/all/items", authenticateToken, authenticateRole,upload , handleGetItems);
router.put("/update/item/:id", authenticateToken, authenticateRole ,upload, handleUpdateItem);

module.exports = router;
