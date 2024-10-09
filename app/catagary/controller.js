const Categories = require("./model");
const mongoose = require("mongoose");
const Items = require("../item/model");
async function handelAddCategory(req, res) {
  const user = await req.user;
  const { name, description } = req.body;
  if (!name || !description) {
    return res
      .status(400)
      .json({ message: "Name and description are required" });
  }
  try {
    const existingCategory = await Categories.findOne({ name });
    if (existingCategory) {
      return res.status(400).json({ message: "Category already exists" });
    }

    const newCategory =  new Categories({
      name,
      description,
      image: req.file
        ? `${req.protocol}://${req.get("host")}/public/${req.file.filename}`
        : null,
      createdBy: user.userId,
    });

    await newCategory.save();
    res
      .status(201)
      .json({ message: "Category created successfully", newCategory });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
}

async function getAllCategory(req, res) {
  try {
    const user = await req.user;
    const allCategory = await Categories.find({createdBy: user.userId});
    res.status(200).json({ categories: allCategory });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
}

async function deleteCategory(req, res) {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid ID" });
  }
  try {
    const linkedItems = await Items.find({ categoryId: id, isDeleted: false });
    if (linkedItems.length > 0) {
      return res.status(400).json({
        message:
          "Category cannot be deleted because it is linked to existing items",
      });
    }
    const deleteExistingCategory = await Categories.findByIdAndDelete(id);
    if (!deleteExistingCategory) {
      return res
        .status(404)
        .json({ message: `Product with ID ${id} not found` });
    }
    res
      .status(200)
      .json({ message: `Category with ID ${id} deleted successfully` });
  } catch (error) {
    res
      .status(500)
      .json({ message: `Failed to delete category with ID ${id}` });
  }
}

async function handleUpdateCategory(req, res) {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid ID" });
  }

  const updateData = {};
  if (req.body.name) updateData.name = req.body.name;
  if (req.body.description) updateData.description = req.body.description;
  if (req.file) {
    updateData.image = `${req.protocol}://${req.get("host")}/public/${
      req.file.filename
    }`;
  }

  if (Object.keys(updateData).length === 0) {
    return res.status(400).json({ message: "No fields provided for update" });
  }

  try {
    const updateCategory = await Categories.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!updateCategory) {
      return res
        .status(404)
        .json({ message: `Category with ID ${id} not found` });
    }

    res
      .status(200)
      .json({ message: "Category updated successfully", updateCategory });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
}

module.exports = {
  handelAddCategory,
  getAllCategory,
  deleteCategory,
  handleUpdateCategory,
};
