const express = require("express");
const authenticateToken = require("../../middleware/authMiddleware");
const {
  handelAddCategory,
  getAllCategory,
  deleteCategory,
} = require("./controller");
const upload = require("../../middleware/multer.js");
const router = express.Router();

router.post("/create/category", authenticateToken, upload, handelAddCategory);
router.get("/all/category", authenticateToken, getAllCategory);
router.delete("/delete/category/:id", authenticateToken, deleteCategory);
module.exports = router;
