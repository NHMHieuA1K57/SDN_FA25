const { VNPay } = require("vnpay/vnpay");
const Order = require("../../models/Order");
const { HashAlgorithm, ProductCode } = require("vnpay/enums");
const { VNP_VERSION, PAYMENT_ENDPOINT } = require("vnpay/constants");

const { resolveUrlString, dateFormat } = require("vnpay/utils");

const vnpayConfig = {
  tmnCode: process.env.VNPAY_TMNCODE,

  secureSecret: process.env.VNPAY_HASHSECRET,

  vnpayHost: process.env.VNPAY_HOST,

  returnUrl: process.env.VNPAY_RETURN_URL,

  testMode: true,
  hashAlgorithm: "SHA512",
  endpoints: {
    paymentEndpoint: "paymentv2/vpcpay.html",
  },
};

const vnpay = new VNPay(vnpayConfig);

const handleCreateVNPayPayment = async (req, res) => {
  try {
    const {
      amount,
      orderInfo,
      userId,
      userName,
      userEmail,
      instructorId,
      instructorName,
      courseImage,
      courseTitle,
      courseId,
    } = req.body;

    console.log(req.body);
    const normalizedOrderInfo = (orderInfo || "Thanh toan khoa hoc")
      .replace(/[^a-zA-Z0-9 ]/g, "")
      .trim();

    const now = new Date();
    const ipAddr = req.headers["x-forwarded-for"] || req.socket.remoteAddress; // 💡 Bước 1: LƯU ORDER VÀO DATABASE để lấy ID
    const amountAsNumber = Number(req.body.amount);
    const priceInDong = Math.round(amountAsNumber * 1000);
    const newOrder = await Order.create({
      userId,
      userName,
      userEmail,
      orderStatus: "pending",
      paymentMethod: "vnpay",
      paymentStatus: "initiated",
      orderDate: now,
      instructorId,
      instructorName,
      courseImage,
      courseTitle,
      courseId,
      coursePricing: priceInDong,
    });

    // 💡 Bước 2: DÙNG ID CỦA DB LÀM MÃ THAM CHIẾU VNPay
    const vnp_txnRefId = newOrder._id.toString();

    const expireDate = new Date(now.getTime() + 15 * 60000);
    const formatCreateDate = dateFormat(now, "yyyyMMddHHmmss");
    const formatExpireDate = dateFormat(expireDate, "yyyyMMddHHmmss");

    const paymentParams = {
      vnp_Version: VNP_VERSION,
      vnp_Command: "pay",
      vnp_TmnCode: vnpayConfig.tmnCode,
      vnp_Locale: "vn",
      vnp_CurrCode: "VND",
      vnp_TxnRef: vnp_txnRefId, // ⬅️ DÙNG ID TỪ DB
      vnp_OrderInfo: normalizedOrderInfo,
      vnp_OrderType: "other",
      vnp_Amount: amount * 100,
      vnp_ReturnUrl: vnpayConfig.returnUrl,
      vnp_IpAddr: ipAddr,
      vnp_CreateDate: formatCreateDate,
      vnp_ExpireDate: formatExpireDate,
    };

    const vnpayUrl = vnpay.buildPaymentUrl(paymentParams);

    return res.status(200).json({
      success: true,
      data: {
        vnpayUrl: vnpayUrl,
        orderId: vnp_txnRefId, // ⬅️ TRẢ VỀ ID TỪ DB
      },
    });
  } catch (e) {
    console.error("Lỗi tạo thanh toán VNPay:", e);
    return res
      .status(500)
      .json({ success: false, message: "Lỗi Server khi tạo thanh toán." });
  }
};

const handleVerifyVNPayReturn = async (req, res) => {
  const vnpayData = req.body;
  console.log(vnpayData);

  // 1. Kiểm tra sự tồn tại của dữ liệu
  if (!vnpayData || !vnpayData.vnp_TxnRef) {
    // Dùng log này để kiểm tra lần cuối xem req.body có gì.
    console.error(
      "LỖI: Frontend không truyền đủ payload. Dữ liệu nhận được:",
      vnpayData
    );
    return res
      .status(200)
      .json({ success: false, message: "Không tìm thấy thông tin giao dịch" });
  }
  try {
    // 2. 🔑 BƯỚC BẢO MẬT: XÁC MINH CHỮ KÝ HASH
    const verifyResult = vnpay.verifyReturnUrl(vnpayData);

    if (!verifyResult.isVerified) {
      console.error("LỖI BẢO MẬT: Chữ ký VNPay không hợp lệ.");
      return res.status(200).json({
        success: false,
        message: "Xác minh bảo mật thất bại (Invalid Signature)",
      });
    }

    // 3. 💾 BƯỚC NGHIỆP VỤ: KIỂM TRA ĐƠN HÀNG TRONG DB
    const vnpTxnRef = vnpayData.vnp_TxnRef; // Mã tham chiếu là ID MongoDB    const amountReceived = parseInt(vnpayData.vnp_Amount) / 100; // Số tiền VNPay trả về (đã chia 100)
    const priceFromVnpayInDong = Number(vnpayData.vnp_Amount) / 1000; // 12050000 / 100 = 120500    const order = await Order.findOne({ _id: vnpTxnRef });
    const order = await Order.findOne({ _id: vnpTxnRef });
    if (!order) {
      return res.status(200).json({
        success: false,
        message: "Không tìm thấy đơn hàng trong hệ thống",
      });
    }

    if (order.orderStatus !== "pending") {
      // Sửa: Dùng orderStatus thay vì status
      // Đơn hàng đã được xử lý (tránh xử lý trùng lặp)
      return res.status(200).json({
        success: true,
        message: "Đơn hàng đã được xử lý trước đó",
        data: { status: order.orderStatus },
      });
    }

    // 💡 SỬA LỖI: So sánh số tiền (Chuyển đổi coursePricing sang Number)
    console.log("Number(order.coursePricing", order.coursePricing);
    console.log("amountReceived", priceFromVnpayInDong);
    if (order.coursePricing !== priceFromVnpayInDong) {
      console.error("LỖI SỐ TIỀN: DB amount không khớp với VNPay amount.");
      return res
        .status(200)
        .json({ success: false, message: "Lỗi: Số tiền giao dịch không khớp" });
    }

    // 4. KIỂM TRA TRẠNG THÁI GIAO DỊCH
    if (
      vnpayData.vnp_TransactionStatus === "00" &&
      vnpayData.vnp_ResponseCode === "00"
    ) {
      // Giao dịch THÀNH CÔNG

      // 💡 Cập nhật Order và Kích hoạt Khóa học
      order.orderStatus = "paid"; // Cập nhật trạng thái
      order.paymentMethod = "vnpay";

      // LƯU: vnp_TransactionNo vào một trường mới trong Model (Bạn cần thêm vnpTransactionNo: String vào Order Model)
      order.paymentId = vnpayData.vnp_TransactionNo;

      // Thêm logic kích hoạt khóa học ở đây...
      await order.save();

      return res.status(200).json({
        success: true,
        message: "Thanh toán thành công!",
        data: { status: "success", orderId: orderId },
      });
    } else {
      // Giao dịch THẤT BẠI
      order.orderStatus = "failed";
      await order.save();

      const errorMessage =
        vnpayData.vnp_TransactionStatus === "02"
          ? "Giao dịch bị hủy hoặc từ chối."
          : "Giao dịch thất bại.";
      return res.status(200).json({ success: false, message: errorMessage });
    }
  } catch (e) {
    console.error("Lỗi xử lý VNPay Return:", e);
    return res
      .status(500)
      .json({ success: false, message: "Lỗi Server khi xác minh giao dịch." });
  }
};

module.exports = { handleCreateVNPayPayment, handleVerifyVNPayReturn };
