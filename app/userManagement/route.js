const express = require("express");
const {
  addNewUser,
  getAllUser,
  deleteUser,
  handleEditUser,
} = require("./controller");
const authenticateToken = require("../../middleware/authMiddleware");
const authenticateRole = require("../../middleware/authRoleMiddleware");
const router = express();

router.post("/create", authenticateToken,authenticateRole, addNewUser);
router.get("/alluser", authenticateToken,authenticateRole, getAllUser);
router.delete("/delete/:id", authenticateToken,authenticateRole, deleteUser);
router.patch("/update/:id", authenticateToken,authenticateRole, handleEditUser);

module.exports = router;
