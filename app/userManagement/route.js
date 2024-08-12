const express = require("express");
const { addNewUser, getAllSubUser } = require("./controller");
const authenticateToken = require("../../utils/authMiddleware");
const router = express();

router.post("/create", authenticateToken, addNewUser);
router.get("/subuser", authenticateToken, getAllSubUser);

module.exports = router;