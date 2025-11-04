import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { CheckCircle, XCircle, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

import { verifyVnpayPaymentService } from "@/services";

const RSP_CODE_MESSAGES = {
  '00': "Thanh toán thành công! Khóa học của bạn đã được kích hoạt.",
  '07': "Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường). Vui lòng liên hệ hỗ trợ.",
  '09': "Thẻ/Tài khoản chưa đăng ký dịch vụ InternetBanking.",
  '10': "Xác thực thông tin thẻ/tài khoản không đúng quá 3 lần.",
  '11': "Đã hết hạn chờ thanh toán. Vui lòng thực hiện lại giao dịch.",
  '12': "Thẻ/Tài khoản của khách hàng bị khóa.",
  '13': "Quý khách nhập sai mật khẩu xác thực giao dịch (OTP).",
  '24': "Khách hàng đã hủy giao dịch.",
  '51': "Tài khoản của quý khách không đủ số dư để thực hiện giao dịch.",
  '65': "Tài khoản của Quý khách đã vượt quá hạn mức giao dịch trong ngày.",
  '75': "Ngân hàng thanh toán đang bảo trì.",
  '79': "KH nhập sai mật khẩu thanh toán quá số lần quy định.",
  '99': "Lỗi không xác định. Vui lòng thử lại hoặc liên hệ hỗ trợ.",
  'DEFAULT_FAIL': "Giao dịch thất bại hoặc đã xảy ra lỗi xác minh."
};

const STATUS = {
  LOADING: 'loading',
  SUCCESS: 'success',
  FAILED: 'failed',
  ERROR: 'error'
};

function VnpayPaymentReturnPage() {
  const location = useLocation();
  const [paymentStatus, setPaymentStatus] = useState(STATUS.LOADING);
  const [message, setMessage] = useState("Đang xác minh giao dịch, vui lòng chờ...");

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const vnpTxnRef = params.get("vnp_TxnRef");

    const vnpayData = Object.fromEntries(params.entries());

    async function verifyPayment() {
      try {
        const response = await verifyVnpayPaymentService(vnpayData);
        const rspCode = response?.rspCode;
        const vnpMessage = RSP_CODE_MESSAGES[rspCode] || RSP_CODE_MESSAGES.DEFAULT_FAIL;

        if (rspCode === "00") {
          setPaymentStatus(STATUS.SUCCESS);
          setMessage(vnpMessage);
          sessionStorage.removeItem("currentOrderId");

        } else {
          setPaymentStatus(STATUS.FAILED);
          setMessage(vnpMessage);

        }
      } catch (error) {
        const errorMessage = "Lỗi hệ thống: Không thể kết nối đến máy chủ xác minh.";
        setPaymentStatus(STATUS.ERROR);
        setMessage(errorMessage);

      }
    }

    if (vnpTxnRef) {
      verifyPayment();
    } else {
      const errorMessage = "Lỗi: Không tìm thấy thông tin giao dịch VNPay trong URL.";
      setPaymentStatus(STATUS.ERROR);
      setMessage(errorMessage);

    }

  }, [location.search]);

  return (
    <div className="flex justify-center items-center min-h-[50vh] p-4">
      <Card className="w-full max-w-md shadow-lg">
        {renderPaymentStatus(paymentStatus, message)}
      </Card>
    </div>
  );
}

export default VnpayPaymentReturnPage;

const renderPaymentStatus = (status, msg) => {
  const isSuccess = status === STATUS.SUCCESS;
  const isFailed = status === STATUS.FAILED || status === STATUS.ERROR;

  let IconComponent, title, color;

  if (status === STATUS.LOADING) {
    IconComponent = Loader;
    title = "Đang Xử Lý Giao Dịch...";
    color = "text-blue-500";
  } else if (isSuccess) {
    IconComponent = CheckCircle;
    title = "Thanh Toán Thành Công";
    color = "text-green-500";
  } else if (isFailed) {
    IconComponent = XCircle;
    title = "Thanh Toán Thất Bại";
    color = "text-red-500";
  }

  return (
    <div className="p-6 text-center">
      <IconComponent className={`w-16 h-16 mx-auto mb-4 ${status === STATUS.LOADING ? 'animate-spin' : ''} ${color}`} />
      <CardHeader className="p-0">
        <CardTitle className={`text-xl font-bold ${color}`}>{title}</CardTitle>
      </CardHeader>
      <CardContent className="mt-4 p-0">
        <p className="text-gray-600 mb-6">{msg}</p>

        <Button
          onClick={() => {
            window.location.href = isSuccess ? "/student-courses" : "/home";
          }}
          className={`w-full ${isSuccess ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
          disabled={status === STATUS.LOADING}
        >
          {isSuccess ? "Đến Khóa Học Của Tôi" : "Thử Lại Thanh Toán"}
        </Button>
      </CardContent>
    </div>
  );
};