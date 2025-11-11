const Course = require("../models/Course");
const Category = require("../models/Category");
const User = require("../models/User");

const AdminCourseController = {
  // ✅ Lấy tất cả khóa học (có phân trang & lọc)
  async getAllCourses(req, res) {
    try {
      const { page = 1, limit = 10, status, category } = req.query;

      const filter = {};
      if (status) filter.isPublised = status === "published";
      if (category) filter.category = category;

      const courses = await Course.find(filter)
        .populate("category", "name")
        .skip((page - 1) * limit)
        .limit(Number(limit));

      const total = await Course.countDocuments(filter);

      res.status(200).json({
        total,
        page: Number(page),
        totalPages: Math.ceil(total / limit),
        courses,
      });
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  },

  // ✅ Lấy chi tiết một khóa học
  async getCourseById(req, res) {
    try {
      const course = await Course.findById(req.params.id)
        .populate("category", "name")
        .lean();

      if (!course) return res.status(404).json({ message: "Course not found" });
      res.status(200).json(course);
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  },

  // ✅ Cập nhật trạng thái khóa học
  async updateCourseStatus(req, res) {
    try {
      const { isPublised } = req.body;
      const updated = await Course.findByIdAndUpdate(
        req.params.id,
        { isPublised },
        { new: true }
      );
      if (!updated) return res.status(404).json({ message: "Course not found" });
      res.status(200).json({ message: "Course status updated", updated });
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  },

  // ✅ Xóa khóa học
  async deleteCourse(req, res) {
    try {
      const deleted = await Course.findByIdAndDelete(req.params.id);
      if (!deleted) return res.status(404).json({ message: "Course not found" });
      res.status(200).json({ message: "Course deleted successfully" });
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  },
};

module.exports = AdminCourseController;
