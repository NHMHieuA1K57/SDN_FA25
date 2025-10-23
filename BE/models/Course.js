const mongoose = require("mongoose");

const LectureSchema = new mongoose.Schema({
  title: String,
  videoUrl: String,
  public_id: String,
  freePreview: Boolean,
});

const CourseSchema = new mongoose.Schema({
  instructorId: String,
  instructorName: String,
  date: Date,
  title: String,
  category: String,
  level: String,
  primaryLanguage: String,
  subtitle: String,
  description: String,
  image: String,
  welcomeMessage: String,
  pricing: Number,
  objectives: String,
  students: [
    {
      studentId: String,
      studentName: String,
      studentEmail: String,
      paidAmount: String,
    },
  ],
  curriculum: [LectureSchema],
  isPublised: Boolean,
});

module.exports = mongoose.model("Course", CourseSchema);


// Quan hệ:
// instructorId → liên kết tới giảng viên (User)
// students[].studentId → liên kết tới học viên (User)
// curriculum[] → chứa nội dung học (lectureId, video URL,…)
// Luồng logic:
// Instructor tạo khóa học → lưu vào Course.
// Khi student thanh toán thành công → thêm vào Course.students[].
// Khi học viên học → cập nhật tiến độ tại Progress.