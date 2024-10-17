const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();
const { connectToDB } = require("./utils/database.js");
const userRoutes = require("./app/userAuth/route.js");
const newUserRoutes = require("./app/userManagement/route.js");
const userPermissionRoutes = require("./app/rolePermission/route.js");
const catagaryRoutes = require("./app/catagary/route.js");
const itemRoutes = require("./app/item/route.js");
const saleRoutes = require("./app/sales/route.js");
const dealRoutes = require("./app/deals/route.js")
const app = express();

let port = process.env.PORT || 4042;

const allowedOrigins = [
  "https://point-of-sale-front-end-qk9p.vercel.app", 
  "http://localhost:3000",                 
  "http://127.0.0.1:3000",              

];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
}));



app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/user", userRoutes);
app.use("/user", newUserRoutes);
app.use("/user", userPermissionRoutes);
app.use("/api", catagaryRoutes);
app.use("/public", express.static(path.join(__dirname, "public")));
app.use("/api", itemRoutes);
app.use("/api", saleRoutes);
app.use("/api", dealRoutes);

// Connect to MongoDB database and start the server
connectToDB()
  .then(() => {
    app.listen(port, () => console.log(`app listen on port ${port}`));
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB", err);
    process.exit(1);
  });
