require("dotenv").config();
const UsersPermission = require("./model");

async function handleAddPermission(req, res) {
  const user = req.user;
  const { roleName } = req.params;
  const { moduleName, actionIds } = req.body;
  if (!roleName) {
    return res.status(400).json({ message: "Role name is required" });
  }
  if (!moduleName || !actionIds) {
    return res.status(400).json({ message: "All fields are required" });
  }
  try {
    const newPermission = new UsersPermission({
      moduleName,
      actionIds,
      createdBy: user.userId
    });
    await newPermission.save();
    res.status(201).json({ message: "Permission added successfully" });
  } catch (error) {
    console.error("Error adding permission:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

module.exports = {
  handleAddPermission,
};
