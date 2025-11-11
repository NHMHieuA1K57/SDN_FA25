const express = require("express");
const router = express.Router();
const RevenueController = require("../controllers/revenue.controller");

// Tổng doanh thu toàn hệ thống
router.get("/total", RevenueController.getTotalRevenue);

// Doanh thu theo tháng
router.get("/monthly", RevenueController.getMonthlyRevenue);

// Doanh thu theo giảng viên
router.get("/instructors", RevenueController.getRevenueByInstructor);

// Doanh thu theo khóa học
router.get("/courses", RevenueController.getRevenueByCourse);

module.exports = router;
