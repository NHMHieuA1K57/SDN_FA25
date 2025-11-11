const Category = require("../../models/Category");

exports.getAllCategories = async (req, res) => {
  try {
    console.log("Fetching all categories");
    const categories = await Category.find({ status: "active" }).sort({
      order: 1,
    });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: "Error fetching categories" });
  }
};

exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }
    res.json(category);
  } catch (error) {
    res.status(500).json({ error: "Error fetching category" });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const { name, description, icon, order, status } = req.body;

    const slug = name.toLowerCase().replace(/[^a-zA-Z0-9]/g, "-");

    const category = new Category({
      name,
      description,
      slug,
      icon,
      order,
      status,
    });

    const savedCategory = await category.save();
    res.status(201).json(savedCategory);
  } catch (error) {}
};

exports.updateCategory = async (req, res) => {
  try {
    const { name, description, icon, order, status } = req.body;
    const updateData = { name, description, icon, order, status };

    if (name) {
      updateData.slug = name.toLowerCase().replace(/[^a-zA-Z0-9]/g, "-");
    }

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    res.json(category);
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ error: "Category with this name already exists" });
    } else {
      res.status(500).json({ error: "Error updating category" });
    }
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }
    res.json({ message: "Category deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error deleting category" });
  }
};
