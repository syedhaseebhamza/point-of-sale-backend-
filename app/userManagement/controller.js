const newUser = require("./model");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

// User Login Authentication
async function login(req, res) {
  const { username, password } = req.body;
  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "username and password are required" });
  }
  try {
    let user = await newUser.findOne({ username });

    if (!user) {
      return res.status(400).json({ message: "Invalid username or password" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid username or password" });
    }
    const token = jwt.sign(
      { userId: user._id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "4h" }
    );
    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Handle to Add New User
async function addNewUser(req, res) {
  const user = req.user;
  const createdBy = user.userId;
  const discount = await newUser.findById({ _id: createdBy });
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
      createdBy,
      discount: discount.discount,
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

// Get the Discount
async function getDiscount(req, res) {
  try {
    const user = await req.user;
    const id = user.userId;
    const discount = await newUser.findById({ _id: id });
    return res.status(200).json({
      message: "Discount fetched successfully",
      discount: discount.discount,
    });
  } catch (error) {
    console.error("Error fetching discount:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

//  Handle to Update Discount
async function updateDiscount(req, res) {
  try {
    const user = await req.user;
    const id = user.userId;
    const { newDiscount } = req.body;

    if (newDiscount == null || typeof newDiscount !== "number") {
      return res.status(400).json({
        message: "Invalid discount value. Please provide a valid number.",
      });
    }

    const updatedDiscount = await newUser.findByIdAndUpdate(
      { _id: id },
      { discount: newDiscount },
      { new: true ,
        runValidators: true,
      }
    );

    return res.status(200).json({
      message: "Discount updated successfully",
      discount: updatedDiscount.discount
    });
  } catch (error) {
    console.error("Error updating discount:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}


module.exports = {
  login,
  addNewUser,
  getAllUser,
  deleteUser,
  handleEditUser,
  getDiscount,
  updateDiscount
};
