const express = require("express");
const router = express.Router();
const authenticateToken = require("../../middleware/authMiddleware");
const { handleAddPermission } = require("./controller");

router.post("/permission/:roleName", authenticateToken, handleAddPermission);

module.exports = router;
