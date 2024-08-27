const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();
const { connectToDB } = require("./utils/database.js");
const userRoutes = require("./app/userAuth/route.js");
const newUserRoutes = require("./app/userManagement/route.js");
const userPermissionRoutes = require("./app/rolePermission/route.js");
const app = express();

app.use(
  cors({
    origin: "https://localhost:3000",
    optionsSuccessStatus: 200,
  })
);

let port = process.env.PORT || 4042;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use("/user", userRoutes);
app.use("/user", newUserRoutes);
app.use("/user", userPermissionRoutes);

connectToDB()
  .then(() => {
    app.listen(port, () => console.log(`app listen on port ${port}`));
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB", err);
    process.exit(1);
  });
