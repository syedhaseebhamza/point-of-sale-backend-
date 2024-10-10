const newUser = require("./model");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

// Handle to Add New User
async function addNewUser(req, res) {
  const user = req.user;
  const createdBy = user.userId
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
      createdBy
    });
    await user.save();
    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Handle to Get All User
async function getAllUser(req, res) {
  try {
    const allUsers = await newUser.find({}, { password: 0 });
    res.status(200).json({ users: allUsers });
  } catch (error) {
    console.error("Error Fetch User:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Handle to Delete User
async function deleteUser(req, res) {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid ID" });
  }

  try {
    const deleteUser = await newUser.findByIdAndDelete(id);
    if (!deleteUser) {
      return res
        .status(404)
        .json({ message: `Product with ID ${id} not found` });
    }
    res
      .status(200)
      .json({ message: `Product with ID ${id} deleted successfully` });
  } catch (error) {
    res.status(500).json({ message: `Failed to delete product with ID ${id}` });
  }
}

// Handle to Update User
async function handleEditUser(req, res) {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid ID" });
  }

  const { username, role } = req.body;
  const updateData = {};
  if (username) updateData.username = username;
  if (role) updateData.role = role;

  try {
    const updateSubUser = await newUser
      .findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
      .select("-password");

    if (!updateSubUser) {
      return res
        .status(404)
        .json({ message: `Subuser with ID ${id} not found` });
    }

    res.status(200).json(updateSubUser);
  } catch (error) {
    res.status(500).json({ message: `Failed to update subuser with ID ${id}` });
  }
}

module.exports = {
  addNewUser,
  getAllUser,
  deleteUser,
  handleEditUser,
};
