const Course = require("../../models/Course");
const Category = require("../../models/Category");
const StudentCourses = require("../../models/StudentCourses");

const getAllStudentViewCourses = async (req, res) => {
  try {
    const {
      category,
      level = [],
      primaryLanguage = [],
      sortBy = "price-lowtohigh",
      search = "",
    } = req.query;

    let filters = {};
      if (category && category.trim() !== "") {
        // Hỗ trợ nhiều category truyền vào dạng comma-separated slugs
        const slugs = category.split(",").map((s) => s.trim()).filter(Boolean);
        const categoryDocs = await Category.find({ slug: { $in: slugs } });
        if (categoryDocs && categoryDocs.length) {
          filters.category = { $in: categoryDocs.map((c) => c._id) };
        } else {
          // Nếu không tìm thấy category phù hợp, trả về mảng rỗng ngay
          return res.status(200).json({ success: true, data: [] });
        }
    }
    if (level && level.length) {
      filters.level = { $in: level.split(",") };
    }
    if (primaryLanguage && primaryLanguage.length) {
      filters.primaryLanguage = { $in: primaryLanguage.split(",") };
    }

    // tìm kiếm theo title, description hoặc instructorName
    if (search && search.trim() !== "") {
      const s = search.trim();
      filters.$or = [
        { title: { $regex: s, $options: "i" } },
        { description: { $regex: s, $options: "i" } },
        { instructorName: { $regex: s, $options: "i" } },
      ];
    }

    let sortParam = {};
    switch (sortBy) {
      case "price-lowtohigh":
        sortParam.pricing = 1;

        break;
      case "price-hightolow":
        sortParam.pricing = -1;

        break;
      case "title-atoz":
        sortParam.title = 1;

        break;
      case "title-ztoa":
        sortParam.title = -1;

        break;

      default:
        sortParam.pricing = 1;
        break;
    }

    filters.isPublised = true;

    const coursesList = await Course.find(filters)
      .populate("category")
      .sort(sortParam);

    // nhiều slug lọc các courses theo slug
    let filteredCourses;
    if (category && category.trim() !== "") {
      const slugs = category.split(",").map((s) => s.trim()).filter(Boolean);
      filteredCourses = coursesList.filter(
        (course) => course.category && slugs.includes(course.category.slug)
      );
    } else {
      filteredCourses = coursesList;
    }

    res.status(200).json({
      success: true,
      data: filteredCourses,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

const getStudentViewCourseDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const courseDetails = await Course.findById(id);

    if (!courseDetails) {
      return res.status(404).json({
        success: false,
        message: "No course details found",
        data: null,
      });
    }

    res.status(200).json({
      success: true,
      data: courseDetails,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

const checkCoursePurchaseInfo = async (req, res) => {
  try {
    const { id, studentId } = req.params;

    const studentCourses = await StudentCourses.findOne({
      userId: studentId,
    });

    if (!studentCourses) {
      return res.status(200).json({
        success: true,
        data: null,
      });
    }

    const ifStudentAlreadyBoughtCurrentCourse =
      studentCourses.courses.findIndex((item) => item.courseId === id) > -1;

    res.status(200).json({
      success: true,
      data: ifStudentAlreadyBoughtCurrentCourse,
    });
  } catch (e) {
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

module.exports = {
  getAllStudentViewCourses,
  getStudentViewCourseDetails,
  checkCoursePurchaseInfo,
};
