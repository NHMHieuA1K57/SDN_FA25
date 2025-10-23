const mongoose = require("mongoose");

const LectureProgressSchema = new mongoose.Schema({
  lectureId: String,
  viewed: Boolean,
  dateViewed: Date,
});

const CourseProgressSchema = new mongoose.Schema({
  userId: String,
  courseId: String,
  completed: Boolean,
  completionDate: Date,
  lecturesProgress: [LectureProgressSchema],
});

module.exports = mongoose.model("Progress", CourseProgressSchema);


// Khi student mở video → hệ thống ghi nhận lectureId, viewed=true, dateViewed.
// Khi tất cả lecture đều viewed=true → completed=true, completionDate = ngày hoàn tất.
// Cho phép thống kê tiến độ (dashboard giảng viên hoặc học viên).