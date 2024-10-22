require("dotenv").config();
const mongoose = require("mongoose");
const newUser = require("../app/userManagement/model.js");
const { connectToDB } = require("../utils/database.js");
const bcrypt = require("bcryptjs");

const adminUser = [
  {
    username: "admin",
    password: "adminpassword",
    role: "superadmin",
  },
];

const seedUsers = async () => {
  try {
    await connectToDB();
    for (const user of adminUser) {
      user.password = await bcrypt.hash(user.password, 10);
    }
    await newUser.deleteMany({});
    await newUser.insertMany(adminUser);
    console.log("Seeding completed!");
  } catch (error) {
    console.error("Error seeding data:", error);
  } finally {
    mongoose.connection.close();
  }
};
seedUsers();
