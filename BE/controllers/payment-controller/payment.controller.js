const { VNPay } = require("vnpay");
const Order = require("../../models/Order");
const StudentCourses = require("../../models/StudentCourses");
const Course = require("../../models/Course");

const vnpayConfig = {
  tmnCode: process.env.VNPAY_TMNCODE,
  secureSecret: process.env.VNPAY_HASHSECRET,
  testMode: process.env.NODE_ENV !== "production",
};

const vnpay = new VNPay(vnpayConfig);

const handleCreateVNPayPayment = async (req, res) => {
  try {
    const { amount, orderInfo, userId, ...otherOrderDetails } = req.body;
    const now = new Date();
    const ipAddr =
      req.headers["x-forwarded-for"]?.split(",").shift() ||
      req.socket.remoteAddress;

    const newOrder = await Order.create({
      userId,
      orderStatus: "pending",
      paymentMethod: "vnpay",
      paymentStatus: "initiated",
      orderDate: now,
      coursePricing: amount,
      ...otherOrderDetails,
    });
    const vnp_txnRef = `ORDER_${Date.now()}`;

    newOrder.vnpTxnRef = vnp_txnRef;

    await newOrder.save();
    const paymentUrl = vnpay.buildPaymentUrl({
      vnp_Amount: amount,
      vnp_IpAddr: ipAddr,
      vnp_ReturnUrl: process.env.VNPAY_RETURN_URL,
      vnp_TxnRef: vnp_txnRef,
      vnp_OrderInfo: (orderInfo || "Thanh toan khoa hoc").substring(0, 100),
    });

    return res.status(200).json({
      success: true,
      data: {
        vnpayUrl: paymentUrl,
      },
    });
  } catch (e) {
    return res
      .status(500)
      .json({ success: false, message: "Lỗi Server khi tạo thanh toán." });
  }
};

const handleVerifyVNPayReturn = async (req, res) => {
  try {
    const vnpData = req.body;

    //  Xác minh chữ ký (signature)
    const verification = vnpay.verifyReturnUrl(vnpData);
    if (!verification.isVerified) {
      return res
        .status(200)
        .json({ rspCode: "97", message: "Invalid Signature" });
    }

    //  Kiểm tra đơn hàng
    const order = await Order.findOne({ vnpTxnRef: vnpData.vnp_TxnRef });
    if (!order) {
      return res
        .status(200)
        .json({ rspCode: "01", message: "Order not found" });
    }

    if (order.orderStatus !== "pending") {
      return res
        .status(200)
        .json({ rspCode: "02", message: "Order already confirmed" });
    }

    //  Xác minh số tiền
    const amountFromVnpay = Number(vnpData.vnp_Amount);
    const amountFromOrder = order.coursePricing * 100;
    if (amountFromOrder !== amountFromVnpay) {
      return res.status(200).json({ rspCode: "04", message: "Invalid amount" });
    }

    //  Xử lý kết quả thanh toán
    const { vnp_ResponseCode, vnp_TransactionStatus } = vnpData;
    if (vnp_ResponseCode === "00" && vnp_TransactionStatus === "00") {
      await handlePaymentSuccess(order, vnpData);
      return res.status(200).json({ rspCode: "00", message: "success" });
    }

    //  Nếu thất bại
    await handlePaymentFailure(order);
    return res.status(200).json({
      rspCode: vnp_ResponseCode || "99",
      message: "Transaction Failed by VNPAY",
    });
  } catch (e) {
    console.error("VNPay callback error:", e);
    return res.status(200).json({ rspCode: "99", message: "Unknown error" });
  }
};

// Hàm xử lý khi thanh toán thành công
const handlePaymentSuccess = async (order, vnpData) => {
  order.orderStatus = "paid";
  order.paymentStatus = "success";
  order.paymentId = vnpData.vnp_TransactionNo;
  await order.save();

  try {
    await updateStudentCourses(order);
    await addStudentToCourse(order);
  } catch (e) {
    console.error("Error updating student data:", e);
  }
};

//  Hàm xử lý khi thanh toán thất bại
const handlePaymentFailure = async (order) => {
  order.orderStatus = "failed";
  order.paymentStatus = "failed";
  await order.save();
};

//  Cập nhật bảng StudentCourses
const updateStudentCourses = async (order) => {
  const studentCourses = await StudentCourses.findOne({ userId: order.userId });

  const courseInfo = {
    courseId: order.courseId,
    title: order.courseTitle,
    instructorId: order.instructorId,
    instructorName: order.instructorName,
    dateOfPurchase: order.orderDate,
    courseImage: order.courseImage,
  };

  if (studentCourses) {
    studentCourses.courses.push(courseInfo);
    await studentCourses.save();
  } else {
    const newStudentCourses = new StudentCourses({
      userId: order.userId,
      courses: [courseInfo],
    });
    await newStudentCourses.save();
  }
};

// Cập nhật bảng Course (thêm học viên)
const addStudentToCourse = async (order) => {
  await Course.findByIdAndUpdate(order.courseId, {
    $addToSet: {
      students: {
        studentId: order.userId,
        studentName: order.userName,
        studentEmail: order.userEmail,
        paidAmount: order.coursePricing,
      },
    },
  });
};

module.exports = {
  handleCreateVNPayPayment,
  handleVerifyVNPayReturn,
};
