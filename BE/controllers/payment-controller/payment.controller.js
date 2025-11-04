const { VNPay } = require('vnpay');
const Order = require("../../models/Order");

const vnpayConfig = {
  tmnCode: process.env.VNPAY_TMNCODE,
  secureSecret: process.env.VNPAY_HASHSECRET,
  testMode: process.env.NODE_ENV !== 'production',
};

const vnpay = new VNPay(vnpayConfig);


const handleCreateVNPayPayment = async (req, res) => {
  try {
    const { amount, orderInfo, userId, ...otherOrderDetails } = req.body;
    const now = new Date();
    const ipAddr = req.headers["x-forwarded-for"]?.split(',').shift() || req.socket.remoteAddress;

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
    console.error("Lỗi tạo thanh toán VNPay:", e);
    return res
      .status(500)
      .json({ success: false, message: "Lỗi Server khi tạo thanh toán." });
  }
};


const handleVerifyVNPayReturn = async (req, res) => {
  try {
    const vnpData = req.body;

    const verification = vnpay.verifyReturnUrl(vnpData);

    if (!verification.isVerified) {
      console.error("LỖI BẢO MẬT: Chữ ký VNPay không hợp lệ.");
      return res.status(200).json({ rspCode: '97', message: 'Invalid Signature' });
    }
    console.log("Hash Verification: Thành công."); // 🎯 LOG 2

    const vnpTxnRef = vnpData.vnp_TxnRef;

    const order = await Order.findOne({ vnpTxnRef });
    if (!order) {
      console.warn(`CẢNH BÁO: KHÔNG TÌM THẤY Order trong DB! vnpTxnRef: ${vnpTxnRef}`);
      return res.status(200).json({ rspCode: '01', message: 'Order not found' });
    }

    if (order.orderStatus !== "pending") {
      return res.status(200).json({ rspCode: '02', message: 'Order already confirmed' });
    }

    const amountFromVnpay = Number(vnpData.vnp_Amount);
    const amountFromOrder = order.coursePricing * 100;

    if (amountFromOrder !== amountFromVnpay) {
      console.error(`LỖI SỐ TIỀN: DB (${amountFromOrder}) KHÔNG KHỚP VNPay (${amountFromVnpay}).`);
      return res.status(200).json({ rspCode: '04', message: 'Invalid amount' });
    }

    if (vnpData.vnp_ResponseCode === "00" && vnpData.vnp_TransactionStatus === "00") {
      order.orderStatus = "paid";
      order.paymentStatus = "success";
      order.paymentId = vnpData.vnp_TransactionNo;
      await order.save();

      return res.status(200).json({ rspCode: '00', message: 'Success' });
    } else {
      order.orderStatus = "failed";
      order.paymentStatus = "failed";
      await order.save();

      return res.status(200).json({ rspCode: '00', message: 'Success', Detail: 'Transaction Failed' });
    }
  } catch (e) {
    console.error("Lỗi xử lý VNPay Return (Hệ thống):", e.message || e);
    return res.status(200).json({ rspCode: '99', message: 'Unknown error' });
  }
};

module.exports = {
  handleCreateVNPayPayment,
  handleVerifyVNPayReturn
};