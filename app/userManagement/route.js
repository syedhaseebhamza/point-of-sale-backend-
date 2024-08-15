const express = require("express");
const {
  addNewUser,
  getAllSubUser,
  deleteSubUser,
  handelEditSubuser,
} = require("./controller");
const authenticateToken = require("../../utils/authMiddleware");
const router = express();

router.post("/create", authenticateToken, addNewUser);
router.get("/subuser", authenticateToken, getAllSubUser);
router.delete("/delete/:id", authenticateToken, deleteSubUser);
router.patch("/update/:id", authenticateToken, handelEditSubuser);

module.exports = router;
