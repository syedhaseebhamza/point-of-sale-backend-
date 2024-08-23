require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../app/userAuth/model");
const { connectToDB } = require("../utils/database.js");
const bcrypt = require("bcryptjs");

const adminUser = [
  {
    username: "admin",
    password: "adminpassword",
    role: "admin",
  },
];

const seedUsers = async () => {
  try {
    await connectToDB();
    for (const user of adminUser) {
      user.password = await bcrypt.hash(user.password, 10);
    }
    await User.deleteMany({});
    await User.insertMany(adminUser);
    console.log("Seeding completed!");
  } catch (error) {
    console.error("Error seeding data:", error);
  } finally {
    mongoose.connection.close();
  }
};
seedUsers();
