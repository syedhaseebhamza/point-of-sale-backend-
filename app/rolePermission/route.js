const express = require("express");
const router = express.Router();
const authenticateToken = require("../../middleware/authMiddleware");
const { handleAddPermission } = require("./controller");
const authenticateRole = require("../../middleware/authRoleMiddleware");

router.post("/permission/:roleName", authenticateToken,authenticateRole, handleAddPermission);

module.exports = router;
