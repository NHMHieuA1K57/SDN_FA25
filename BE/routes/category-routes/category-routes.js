const express = require("express");
const router = express.Router();
const categoryController = require("../../controllers/category-controller/category-controller");

router.get("/", categoryController.getAllCategories);
router.get("/:id", categoryController.getCategoryById);

// router.post("/", requireSignin, isAdmin, categoryController.createCategory);
// router.put("/:id", requireSignin, isAdmin, categoryController.updateCategory);
// router.delete("/:id", requireSignin, isAdmin, categoryController.deleteCategory);

module.exports = router;
