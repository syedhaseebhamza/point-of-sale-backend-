const express = require("express");
const router = express.Router();
const authenticateToken = require("../../middleware/authMiddleware");
const authenticateRole = require("../../middleware/authRoleMiddleware");
const upload = require("../../middleware/multer");
const {
  handleAddDeals,
  handleGetDeals,
  deleteDeals,
  handleUpdateDeals,
} = require("./controller");

router.post("/create/deal", authenticateToken, authenticateRole,upload , handleAddDeals);
router.delete("/delete/deal/:id", authenticateToken, authenticateRole , deleteDeals);
router.get("/all/deals", authenticateToken, authenticateRole,upload , handleGetDeals);
router.put("/update/deal/:id", authenticateToken, authenticateRole ,upload, handleUpdateDeals);

module.exports = router;
