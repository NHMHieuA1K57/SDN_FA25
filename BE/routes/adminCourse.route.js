const express = require("express");
const router = express.Router();
const AdminCourseController = require("../controllers/adminCourse.controller");

// GET all courses (with filter)
router.get("/", AdminCourseController.getAllCourses);

// GET one course
router.get("/:id", AdminCourseController.getCourseById);

// UPDATE publish status
router.put("/:id/status", AdminCourseController.updateCourseStatus);

// DELETE course
router.delete("/:id", AdminCourseController.deleteCourse);

module.exports = router;
