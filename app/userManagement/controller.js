const newUser = require("./model");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
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

async function getAllUser(req, res) {
  try {
    const allUsers = await newUser.find({}, { password: 0 });
    res.status(200).json({ users: allUsers });
  } catch (error) {
    console.error("Error Fetch User:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
async function deleteUser(req, res) {
  const { id } = req.params; // jab hum req.query lagay gay yahan pay to postman mai ja kr params wala tab select kr wahan id deni ha then url ho ga  ?id=123 is trhn aye ga
  // jab hum params lagay gay then hum router main b ja kr user/delete/:id dain gay or url mai user/subuser/12343 is thrn postman maim id aye gi
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
async function handleEditUser(req, res) {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid ID" });
  }
  const { username, role } = req.body;
  if ((!username, !role)) {
    return res.status(400).json({ message: "all filed are required " });
  }
  try {
    const updateSubUser = await newUser
      .findByIdAndUpdate(
        id,
        {
          username,
          role,
        },
        { new: true, runValidators: true }
      )
      .select("-password");
    if (!updateSubUser) {
      return res
        .status(404)
        .json({ message: `subuser with ID ${id} not found` });
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
