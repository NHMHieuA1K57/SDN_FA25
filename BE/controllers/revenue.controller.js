const Order = require("../models/Order");
const Course = require("../models/Course");
const User = require("../models/User");
const mongoose = require("mongoose");

const RevenueController = {
  // ✅ Tổng doanh thu toàn hệ thống
  async getTotalRevenue(req, res) {
    try {
      const totalRevenue = await Order.aggregate([
        { $match: { paymentStatus: "success" } },
        { $group: { _id: null, total: { $sum: "$coursePricing" } } },
      ]);

      res.status(200).json({
        totalRevenue: totalRevenue[0]?.total || 0,
      });
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  },

  // ✅ Doanh thu theo tháng (biểu đồ)
  async getMonthlyRevenue(req, res) {
    try {
      const monthlyRevenue = await Order.aggregate([
        { $match: { paymentStatus: "success" } },
        {
          $group: {
            _id: { $month: "$orderDate" },
            total: { $sum: "$coursePricing" },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id": 1 } },
      ]);

      res.status(200).json(monthlyRevenue);
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  },

  // ✅ Doanh thu theo giảng viên
  async getRevenueByInstructor(req, res) {
    try {
      const revenue = await Order.aggregate([
        { $match: { paymentStatus: "success" } },
        {
          $group: {
            _id: "$instructorId",
            instructorName: { $first: "$instructorName" },
            totalRevenue: { $sum: "$coursePricing" },
            totalCoursesSold: { $sum: 1 },
          },
        },
        { $sort: { totalRevenue: -1 } },
      ]);

      res.status(200).json(revenue);
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  },

  // ✅ Doanh thu theo khóa học
  async getRevenueByCourse(req, res) {
    try {
      const revenue = await Order.aggregate([
        { $match: { paymentStatus: "success" } },
        {
          $group: {
            _id: "$courseId",
            courseTitle: { $first: "$courseTitle" },
            instructorName: { $first: "$instructorName" },
            totalRevenue: { $sum: "$coursePricing" },
            totalSales: { $sum: 1 },
          },
        },
        { $sort: { totalRevenue: -1 } },
      ]);

      res.status(200).json(revenue);
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  },
};

module.exports = RevenueController;
