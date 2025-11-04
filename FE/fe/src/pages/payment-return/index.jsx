import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { CheckCircle, XCircle, Loader } from "lucide-react"; // Cần cài gói lucide-react
import { Button } from "@/components/ui/button"; 
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

// Giả định bạn có một service để xác nhận kết quả VNPay từ Backend
// Hàm này sẽ gọi API Backend để Backend xác minh SecureHash và cập nhật DB.
import { verifyVnpayPaymentService } from "@/services"; 

// --- Định nghĩa trạng thái hiển thị ---
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
    // 1. Lấy tất cả tham số query từ URL do VNPay gửi về
    const params = new URLSearchParams(location.search);
    const vnpResponseCode = params.get("vnp_ResponseCode");
    const vnpTxnRef = params.get("vnp_TxnRef"); // Order ID của bạn
    
    // Chuyển params thành object để gửi lên Backend
    const vnpayData = Object.fromEntries(params.entries());

    if (vnpTxnRef) {
        async function verifyPayment() {
            // Lấy Order ID ban đầu (để đảm bảo không bị thất lạc)
            const currentOrderId = sessionStorage.getItem("currentOrderId");
            
            // 2. GỌI BACKEND XÁC MINH (Bảo mật)
            // Backend sẽ kiểm tra SecureHash và cập nhật DB
            try {
                const response = await verifyVnpayPaymentService(vnpayData);

                if (response?.success) {
                    // Backend xác nhận Hash hợp lệ VÀ DB đã được cập nhật
                    setPaymentStatus(STATUS.SUCCESS);
                    setMessage("Thanh toán thành công! Khóa học đã được kích hoạt.");
                    sessionStorage.removeItem("currentOrderId");
                } else {
                    // Backend xác minh hash thất bại HOẶC DB lỗi
                    setPaymentStatus(STATUS.FAILED);
                    setMessage(response?.message || "Giao dịch thất bại hoặc đã xảy ra lỗi xác minh.");
                }
            } catch (error) {
                // Lỗi kết nối API
                setPaymentStatus(STATUS.ERROR);
                setMessage("Lỗi hệ thống: Không thể kết nối đến máy chủ xác minh.");
            }
        }

        verifyPayment();

    } else {
        // Trường hợp không có tham số VNPay (Lỗi truy cập trực tiếp)
        setPaymentStatus(STATUS.ERROR);
        setMessage("Lỗi: Không tìm thấy thông tin giao dịch VNPay.");
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

// --- Hàm Render Giao diện theo trạng thái ---
const renderPaymentStatus = (status, msg) => {
  const isSuccess = status === STATUS.SUCCESS;
  const isFailed = status === STATUS.FAILED || status === STATUS.ERROR;
  
  // 🚀 Thiết kế giao diện đẹp hơn
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
      <IconComponent className={`w-16 h-16 mx-auto mb-4 animate-spin-slow ${isSuccess ? 'animate-none' : ''} ${color}`} />
      <CardHeader className="p-0">
        <CardTitle className={`text-xl font-bold ${color}`}>{title}</CardTitle>
      </CardHeader>
      <CardContent className="mt-4 p-0">
        <p className="text-gray-600 mb-6">{msg}</p>
        
        <Button 
          onClick={() => { window.location.href = isSuccess ? "/student-courses" : "/checkout"; }}
          className={`w-full ${isSuccess ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
          disabled={status === STATUS.LOADING}
        >
          {isSuccess ? "Đến Khóa Học" : "Thử Lại Thanh Toán"}
        </Button>
      </CardContent>
    </div>
  );
};