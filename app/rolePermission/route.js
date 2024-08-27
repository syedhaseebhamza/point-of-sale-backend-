const express = require("express");
const router = express.Router();
const authenticateToken = require("../../utils/authMiddleware");
const { handleAddPermission } = require("./controller");

router.post("/permission/:roleName", authenticateToken, handleAddPermission);

module.exports = router;
