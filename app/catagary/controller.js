const Categories = require("./model");
const mongoose = require("mongoose");
const Items = require("../item/model");
const cloudinary = require("cloudinary").v2;

// Handle to Add Category
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

    const newCategory = new Categories({
      name,
      description,
      image: req.file ? req.file.path : null,
      public_id: req.file ? req.file.filename : null,
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

// Handle to Get All Categories
async function getAllCategory(req, res) {
  try {
    const user = await req.user;
    const allCategory = await Categories.find({ createdBy: user.userId });
    res.status(200).json({ categories: allCategory });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
}

// Handle to Delete Category
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
    const existingCategory = await Categories.findById(id);
    if (!existingCategory) {
      return res
        .status(404)
        .json({ message: `Category with ID ${id} not found` });
    }

    if (existingCategory.public_id) {
      await cloudinary.uploader.destroy(existingCategory.public_id);
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
    console.log(error);
    res
      .status(500)
      .json({ message: `Failed to delete category with ID ${id}` });
  }
}

// Handle to Update Category
async function handleUpdateCategory(req, res) {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid ID" });
  }

  const updateData = {};
  if (req.body.name) updateData.name = req.body.name;
  if (req.body.description) updateData.description = req.body.description;
  const existingCategory = await Categories.findById(id);
  if (req.file) {
    if (existingCategory.public_id) {
      await cloudinary.uploader.destroy(existingCategory.public_id);
    }
    updateData.image = req.file.path;
    updateData.public_id = req.file.filename;
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
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
}

module.exports = {
  handelAddCategory,
  getAllCategory,
  deleteCategory,
  handleUpdateCategory,
};
