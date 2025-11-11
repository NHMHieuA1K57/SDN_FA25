const mongoose = require("mongoose");
const Course = require("../../models/Course");
const Category = require("../../models/Category");
const StudentCourses = require("../../models/StudentCourses");
const { Types } = require("mongoose");

const toCSVArray = (v) =>
  Array.isArray(v)
    ? v
    : String(v || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// ĐỔI tên này cho đúng với schema của bạn: 'isPublised' hoặc 'isPublished'
const PUBLISH_FIELD_NAME = "isPublised"; // <-- nếu schema của bạn đang bị sai chính tả

const getAllStudentViewCourses = async (req, res) => {
  try {
    const {
      category,
      level = "",
      primaryLanguage = "",
      sortBy = "price-lowtohigh",
      search = "",
    } = req.query;

    console.log("Filters received:", req.query);

    const filters = {};
    filters[PUBLISH_FIELD_NAME] = true; // dùng đúng tên field publish

    // ---- Category: nhận id/slug/name ----
    if (category && String(category).trim() !== "") {
      const tokens = toCSVArray(category);

      const idList = [];
      const slugList = [];
      const nameList = [];

      for (const t of tokens) {
        if (mongoose.Types.ObjectId.isValid(t))
          idList.push(new mongoose.Types.ObjectId(t));
        else if (/^[a-z0-9-]+$/.test(t)) slugList.push(t.toLowerCase());
        else nameList.push(t);
      }

      const orConds = [];
      if (idList.length) orConds.push({ _id: { $in: idList } });
      if (slugList.length) orConds.push({ slug: { $in: slugList } });
      if (nameList.length) {
        orConds.push({
          name: {
            $in: nameList.map((n) => new RegExp(`^${escapeRegExp(n)}$`, "i")),
          },
        });
      }

      if (!orConds.length)
        return res.status(200).json({ success: true, data: [] });

      const categoryDocs = await Category.find({ $or: orConds })
        .select("_id slug name")
        .lean();
      console.log(
        "Matched categories:",
        categoryDocs.map((c) => c._id.toString())
      );

      if (!categoryDocs.length)
        return res.status(200).json({ success: true, data: [] });

      const catIds = categoryDocs.map((c) => c._id);
      const catIdStrs = catIds.map((id) => id.toString());

      // HỖ TRỢ cả trường hợp course.category là ObjectId HOẶC string
      filters.$or = [
        { category: { $in: catIds } },
        { category: { $in: catIdStrs } },
      ];
    }

    // ---- level / primaryLanguage (CSV) ----
    const levelArr = toCSVArray(level);
    if (levelArr.length) filters.level = { $in: levelArr };

    const langArr = toCSVArray(primaryLanguage);
    if (langArr.length) filters.primaryLanguage = { $in: langArr };

    // ---- search ----
    if (search && search.trim() !== "") {
      const s = search.trim();
      filters.$and = (filters.$and || []).concat([
        {
          $or: [
            { title: { $regex: s, $options: "i" } },
            { description: { $regex: s, $options: "i" } },
            { instructorName: { $regex: s, $options: "i" } },
          ],
        },
      ]);
    }

    // ---- sort ----
    let sortParam = {};
    switch (sortBy) {
      case "price-lowtohigh":
        sortParam.price = 1; // đổi theo field thật trong schema
        break;
      case "price-hightolow":
        sortParam.price = -1;
        break;
      case "title-atoz":
        sortParam.title = 1;
        break;
      case "title-ztoa":
        sortParam.title = -1;
        break;
      default:
        sortParam.price = 1;
    }

    console.log("Mongo filters:", JSON.stringify(filters));
    const coursesList = await Course.find(filters)
      .populate("category", "name slug")
      .sort(sortParam)
      .lean();

    console.log("Found courses:", coursesList.length);
    return res.status(200).json({ success: true, data: coursesList });
  } catch (e) {
    console.error(e);
    return res
      .status(500)
      .json({ success: false, message: "Some error occurred!" });
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
      "courses.courseId": id,
    });

    if (!studentCourses) {
      return res.status(200).json({
        success: true,
        data: null,
      });
    }

    res.status(200).json({
      success: true,
      data: studentCourses,
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
