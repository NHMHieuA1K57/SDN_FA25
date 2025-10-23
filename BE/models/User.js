const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  userName: String,
  userEmail: String,
  password: String,
  role: String,
});

module.exports = mongoose.model("User", UserSchema);
// Instructor tạo và xuất bản khóa học (Course.instructorId)
// Student mua và theo học khóa học (Order.userId, Progress.userId)