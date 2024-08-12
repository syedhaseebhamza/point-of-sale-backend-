const express = require("express");
const { addNewUser } = require("./controller");
const authenticateToken = require("../../utils/authMiddleware");
const router = express();

router.post("/create", authenticateToken, addNewUser);

module.exports = router;