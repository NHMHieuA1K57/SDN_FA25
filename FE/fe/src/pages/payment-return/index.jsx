import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { CheckCircle, XCircle, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

import { verifyVnpayPaymentService } from "@/services";

const RSP_CODE_MESSAGES = {
  "00": "Thanh toán thành công! Khóa học của bạn đã được kích hoạt.",
  97: "Lỗi bảo mật: Chữ ký giao dịch không hợp lệ. Vui lòng liên hệ hỗ trợ.",
  "01": "Lỗi hệ thống: Không tìm thấy đơn hàng tương ứng. Vui lòng liên hệ hỗ trợ.",
  "02": "Giao dịch đã xử lý",
  "04": "Lỗi hệ thống: Số tiền thanh toán không khớp với đơn hàng. Vui lòng liên hệ hỗ trợ.",
  "07": "Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường). Vui lòng liên hệ hỗ trợ.",
  "09": "Thẻ/Tài khoản chưa đăng ký dịch vụ InternetBanking.",
  10: "Xác thực thông tin thẻ/tài khoản không đúng quá 3 lần.",
  11: "Đã hết hạn chờ thanh toán. Vui lòng thực hiện lại giao dịch.",
  12: "Thẻ/Tài khoản của khách hàng bị khóa.",
  13: "Quý khách nhập sai mật khẩu xác thực giao dịch (OTP).",
  24: "Khách hàng đã hủy giao dịch.",
  51: "Tài khoản của quý khách không đủ số dư để thực hiện giao dịch.",
  65: "Tài khoản của Quý khách đã vượt quá hạn mức giao dịch trong ngày.",
  75: "Ngân hàng thanh toán đang bảo trì.",
  79: "KH nhập sai mật khẩu thanh toán quá số lần quy định.",
  99: "Lỗi không xác định. Vui lòng thử lại hoặc liên hệ hỗ trợ.",
  DEFAULT_FAIL: "Giao dịch thất bại hoặc đã xảy ra lỗi xác minh.",
};

const STATUS = {
  LOADING: "loading",
  SUCCESS: "success",
  FAILED: "failed",
  ERROR: "error",
};

function VnpayPaymentReturnPage() {
  const location = useLocation();
  const [paymentStatus, setPaymentStatus] = useState(STATUS.LOADING);
  const [message, setMessage] = useState(
    "Đang xác minh giao dịch, vui lòng chờ..."
  );

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const vnpTxnRef = params.get("vnp_TxnRef");

    const vnpayData = Object.fromEntries(params.entries());

    async function verifyPayment() {
      try {
        const response = await verifyVnpayPaymentService(vnpayData);
        const rspCode = response?.rspCode;

        const vnpMessage =
          RSP_CODE_MESSAGES[rspCode] || RSP_CODE_MESSAGES.DEFAULT_FAIL;

        if (rspCode === "00") {
          setPaymentStatus(STATUS.SUCCESS);
          setMessage(vnpMessage);
          sessionStorage.removeItem("currentOrderId");
        } else {
          setPaymentStatus(STATUS.FAILED);
          setMessage(vnpMessage);
        }
      } catch (error) {
        const errorMessage =
          "Lỗi hệ thống: Không thể kết nối đến máy chủ xác minh.";
        setPaymentStatus(STATUS.ERROR);
        setMessage(errorMessage);
      }
    }

    if (vnpTxnRef) {
      verifyPayment();
    } else {
      const errorMessage =
        "Lỗi: Không tìm thấy thông tin giao dịch VNPay trong URL.";
      setPaymentStatus(STATUS.ERROR);
      setMessage(errorMessage);
    }
  }, [location.search]);

  return (
    <div className="flex justify-center items-center min-h-[50vh] p-4">
           {" "}
      <Card className="w-full max-w-md shadow-lg">
                {renderPaymentStatus(paymentStatus, message)}     {" "}
      </Card>
         {" "}
    </div>
  );
}

export default VnpayPaymentReturnPage;

const renderPaymentStatus = (status, msg) => {
  const isSuccess = status === STATUS.SUCCESS;
  const isFailed = status === STATUS.FAILED || status === STATUS.ERROR;
  const isLoading = status === STATUS.LOADING;

  let IconComponent, title, colorClass, buttonText, buttonColorClass;

  if (isLoading) {
    IconComponent = Loader;
    title = "Đang Xử Lý Giao Dịch...";
    colorClass = "text-blue-500";
    buttonText = "Đang Xử Lý...";
    buttonColorClass = "bg-gray-400 hover:bg-gray-500";
  } else if (isSuccess) {
    IconComponent = CheckCircle;
    title = "Thanh Toán Thành Công";
    colorClass = "text-green-600";
    buttonText = "Đến Khóa Học Của Tôi";
    buttonColorClass = "bg-green-600 hover:bg-green-700";
  } else if (isFailed) {
    IconComponent = XCircle;
    title = "Thanh Toán Thất Bại";
    colorClass = "text-red-600";
    buttonText = "Thử Lại Thanh Toán";
    buttonColorClass = "bg-red-600 hover:bg-red-700";
  }

  return (
    <div className="p-8 text-center bg-white rounded-xl">
      {" "}
      {/* Tăng padding và làm tròn góc */}
      {/* 1. HIỂN THỊ BIỂU TƯỢNG */}
      <IconComponent
        className={`w-20 h-20 mx-auto mb-6 ${
          // Biểu tượng lớn hơn
          isLoading ? "animate-spin" : ""
        } ${colorClass} transition-colors duration-300`}
      />
      {/* 2. TIÊU ĐỀ KẾT QUẢ */}
      <CardHeader className="p-0 mb-4">
        <CardTitle className={`text-2xl font-extrabold ${colorClass}`}>
          {title}
        </CardTitle>
      </CardHeader>
      {/* 3. THÔNG ĐIỆP CHI TIẾT */}
      <CardContent className="mt-4 p-0">
        <p className="text-gray-700 mb-6 font-medium">{msg}</p>

        {/* Thêm đường phân cách nhẹ */}
        <div className="border-t border-gray-200 my-4"></div>

        {/* 4. VĂN BẢN HỖ TRỢ */}
        {!isSuccess && !isLoading && (
          <p className="text-sm text-gray-500 mb-6">
            Bạn có thể kiểm tra lại thông tin hoặc liên hệ bộ phận hỗ trợ nếu
            cần.
          </p>
        )}

        {/* 5. NÚT HÀNH ĐỘNG */}
        <Button
          onClick={() => {
            window.location.href = isSuccess ? "/student-courses" : "/home";
          }}
          className={`w-full py-2 text-lg font-semibold transition-all duration-300 ${buttonColorClass}`}
          disabled={isLoading}
        >
          {buttonText}
        </Button>
      </CardContent>
    </div>
  );
};
