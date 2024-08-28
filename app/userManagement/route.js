const express = require("express");
const {
  addNewUser,
  getAllUser,
  deleteUser,
  handleEditUser,
} = require("./controller");
const authenticateToken = require("../../middleware/authMiddleware");
const router = express();

router.post("/create", authenticateToken, addNewUser);
router.get("/alluser", authenticateToken, getAllUser);
router.delete("/delete/:id", authenticateToken, deleteUser);
router.patch("/update/:id", authenticateToken, handleEditUser);

module.exports = router;
