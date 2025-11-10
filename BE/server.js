require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const authRoutes = require("./routes/auth-routes/index");
const mediaRoutes = require("./routes/instructor-routes/media-routes");
const instructorCourseRoutes = require("./routes/instructor-routes/course-routes");
const studentViewCourseRoutes = require("./routes/student-routes/course-routes");
const studentViewOrderRoutes = require("./routes/student-routes/order-routes");
const studentCoursesRoutes = require("./routes/student-routes/student-courses-routes");
const studentCourseProgressRoutes = require("./routes/student-routes/course-progress-routes");
const paymentRoutes = require("./routes/payment-routes/payment.route");
const categoryRoutes = require("./routes/category-routes/category-routes");
const StudentCourses = require("./models/StudentCourses");

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST", "DELETE", "PUT"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

//database connection
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("mongodb is connected"))
  .catch((e) => console.log(e));

//routes configuration
app.use("/auth", authRoutes);
app.use("/media", mediaRoutes);
app.use("/instructor/course", instructorCourseRoutes);
app.use("/student/course", studentViewCourseRoutes);
app.use("/student/order", studentViewOrderRoutes);
app.use("/student/courses-bought", studentCoursesRoutes);
app.use("/student/course-progress", studentCourseProgressRoutes);
app.use("/payment/", paymentRoutes);
app.use("/categories", categoryRoutes);
app.use("/test", async (req, res) => {
  const tes = {
    userId: '68f7b4ede7f81ff190eae0dd',
    courses: [
      {
        courseId: "68f9c6a19aecac623a88c33e",
        title: "Fullstack Web Development Bootcamp",
        instructorId: "671f1a001122334455667701",
        instructorName: "Alice Nguyen",
        dateOfPurchase: "2025-10-01T09:00:00.000Z",
        courseImage: "https://example.com/images/fullstack-course.jpg",
      },
    ],
  }
  const tessv = new StudentCourses(tes);
  await tessv.save();
  res.send("This is a test route");
});

app.use((err, req, res, next) => {
  console.log(err.stack);
  res.status(500).json({
    success: false,
    message: "Something went wrong",
  });
});

app.listen(PORT, () => {
  console.log(`Server is now running on port ${PORT}`);
});
