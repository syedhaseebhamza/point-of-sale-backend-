const express = require("express");
const { login } = require("./controller");
const router = express.Router();

router.post("/login", login);
// router.post("/sign_up", signUp);

module.exports = router;
