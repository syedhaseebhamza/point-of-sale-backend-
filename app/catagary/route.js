const express = require("express");
const authenticateToken = require("../../middleware/authMiddleware");
const {
  handelAddCategory,
  getAllCategory,
  deleteCategory,
  handleUpdateCategory,
} = require("./controller");
const upload = require("../../middleware/multer.js");
const router = express.Router();

router.post("/create/category", authenticateToken, upload, handelAddCategory);
router.get("/all/category", authenticateToken, getAllCategory);
router.delete("/delete/category/:id", authenticateToken, deleteCategory);
router.patch("/update/category/:id", authenticateToken, handleUpdateCategory);
module.exports = router;
