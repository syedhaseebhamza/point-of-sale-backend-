const express = require("express");
const { addNewUser } = require("./controller");
const router = express();


router.post("/create", addNewUser);

module.exports = router;
