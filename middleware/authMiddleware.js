const jwt = require("jsonwebtoken");
require("dotenv").config();

// middleware to authenticate token
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token === null) {
    return res.status(401).json({ message: "unAuthorization" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Token Expired" });
    }
    req.user = user;
    next();
  });
}

module.exports = authenticateToken;
