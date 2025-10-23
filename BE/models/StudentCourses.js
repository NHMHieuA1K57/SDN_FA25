const mongoose = require("mongoose");

const StudentCoursesSchema = new mongoose.Schema({
  userId: String,
  courses: [
    {
      courseId: String,
      title: String,
      instructorId: String,
      instructorName: String,
      dateOfPurchase: Date,
      courseImage: String,
    },
  ],
});

module.exports = mongoose.model("StudentCourses", StudentCoursesSchema);


// Quan hệ:
// userId → User._id (Student)
// courses[].courseId → Course._id
// Mục đích:
// Giúp hiển thị danh sách “Khóa học của tôi” (My Courses)
// Giúp Student truy cập nhanh vào học hoặc tiếp tục học khóa cũ