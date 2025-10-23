const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  userId: String,
  userName: String,
  userEmail: String,
  orderStatus: String,
  paymentMethod: String,
  paymentStatus: String,
  orderDate: Date,
  paymentId: String,
  payerId: String,
  instructorId: String,
  instructorName: String,
  courseImage: String,
  courseTitle: String,
  courseId: String,
  coursePricing: String,
});

module.exports = mongoose.model("Order", OrderSchema);


// Quan hệ:
// userId → User._id (Student)
// courseId → Course._id
// instructorId → User._id (Instructor)
// Luồng hoạt động:
// Student chọn khóa học → tạo Order mới (trạng thái "Pending").
// Khi thanh toán thành công → paymentStatus="Success", orderStatus="Completed".
// Sau đó:
// Thêm student vào Course.students[]
// Thêm course vào StudentCourses.courses[]