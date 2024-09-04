const express = require("express");
const router = express.Router();
const authenticateToken = require("../../middleware/authMiddleware");
const { handleGetItems } = require("./controller");

router.get("/all/items", authenticateToken, handleGetItems);

module.exports = router;
