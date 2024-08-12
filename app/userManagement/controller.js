const newUser = require("./model");
const bcrypt = require("bcryptjs");
async function addNewUser(req, res) {
  const { username, password, role } = req.body;
  if ((!username, !password, !role)) {
    return res.status(200).json({ message: "All fields are required" });
  }
  try {
    const existingUser = await newUser.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new newUser({
      username,
      password: hashedPassword,
      role,
    });
    await user.save();
    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

async function getAllSubUser(req, res) {
  try {
    const allUsers = await newUser.find({}, { password: 0 });
    res.status(200).json({ users: allUsers });
  } catch (error) {
    console.error("Error Fetch User:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
module.exports = { addNewUser, getAllSubUser };
