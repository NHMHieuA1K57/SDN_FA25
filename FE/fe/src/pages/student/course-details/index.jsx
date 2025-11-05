import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import VideoPlayer from "@/components/video-player";
import { AuthContext } from "@/context/auth-context";
import { StudentContext } from "@/context/student-context";
import {
  checkCoursePurchaseInfoService,
  createPaymentService,
  fetchStudentViewCourseDetailsService,
} from "@/services";
import { CheckCircle, Globe, Lock, PlayCircle } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { formatCurrencyVND } from "../../../utils/currencyFormatter.js";
function StudentViewCourseDetailsPage() {
  const {
    studentViewCourseDetails,
    setStudentViewCourseDetails,
    currentCourseDetailsId,
    setCurrentCourseDetailsId,
    loadingState,
    setLoadingState,
  } = useContext(StudentContext);

  const { auth } = useContext(AuthContext);

  const [displayCurrentVideoFreePreview, setDisplayCurrentVideoFreePreview] =
    useState(null);
  const [showFreePreviewDialog, setShowFreePreviewDialog] = useState(false);
  const [approvalUrl, setApprovalUrl] = useState("");
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();

  async function fetchStudentViewCourseDetails() {
    // const checkCoursePurchaseInfoResponse =
    //   await checkCoursePurchaseInfoService(
    //     currentCourseDetailsId,
    //     auth?.user._id
    //   );

    // if (
    //   checkCoursePurchaseInfoResponse?.success &&
    //   checkCoursePurchaseInfoResponse?.data
    // ) {
    //   navigate(`/course-progress/${currentCourseDetailsId}`);
    //   return;
    // }

    const response = await fetchStudentViewCourseDetailsService(
      currentCourseDetailsId
    );

    if (response?.success) {
      setStudentViewCourseDetails(response?.data);
      setLoadingState(false);
    } else {
      setStudentViewCourseDetails(null);
      setLoadingState(false);
    }
  }

  function handleSetFreePreview(getCurrentVideoInfo) {
    console.log(getCurrentVideoInfo);
    setDisplayCurrentVideoFreePreview(getCurrentVideoInfo?.videoUrl);
  }

  // async function handleCreatePayment() {
  //   const paymentPayload = {
  //     userId: auth?.user?._id,
  //     userName: auth?.user?.userName,
  //     userEmail: auth?.user?.userEmail,
  //     orderStatus: "pending",
  //     paymentMethod: "paypal",
  //     paymentStatus: "initiated",
  //     orderDate: new Date(),
  //     paymentId: "",
  //     payerId: "",
  //     instructorId: studentViewCourseDetails?.instructorId,
  //     instructorName: studentViewCourseDetails?.instructorName,
  //     courseImage: studentViewCourseDetails?.image,
  //     courseTitle: studentViewCourseDetails?.title,
  //     courseId: studentViewCourseDetails?._id,
  //     coursePricing: studentViewCourseDetails?.pricing,
  //   };

  //   console.log(paymentPayload, "paymentPayload");
  //   const response = await createPaymentService(paymentPayload);

  //   if (response.success) {
  //     sessionStorage.setItem(
  //       "currentOrderId",
  //       JSON.stringify(response?.data?.orderId)
  //     );
  //     setApprovalUrl(response?.data?.approveUrl);
  //   }
  // }

  async function handleCreatePayment() {
    // 1. Kiểm tra dữ liệu cần thiết trước khi gửi yêu cầu
    if (
      !auth?.user?._id ||
      !studentViewCourseDetails?._id ||
      !studentViewCourseDetails?.pricing
    ) {
      alert(
        "Thông tin người dùng hoặc khóa học không đầy đủ. Vui lòng thử lại."
      );
      return; // Dừng hàm nếu thiếu dữ liệu quan trọng
    }

    // Gán giá trị để tránh truy cập lặp lại
    const userId = auth.user._id;
    const course = studentViewCourseDetails;

    // 2. Chuẩn bị Payload cho Backend
    const paymentPayload = {
      // --- Bắt buộc cho DB ---
      userId: userId,
      // 💡 Bổ sung: Tên người dùng
      userName: auth?.user?.userName,
      // 💡 Bổ sung: Email người dùng
      userEmail: auth?.user?.userEmail,
      // 💡 Bổ sung: Tên khóa học và ảnh (đã có trong course, nhưng cần thêm rõ ràng)
      courseImage: course.image,
      courseTitle: course.title,

      // --- Thông tin Khóa học và Giá ---
      courseId: course._id,
      instructorId: course.instructorId,
      // Dùng tên trường Model để đảm bảo đúng kiểu dữ liệu
      coursePricing: course.pricing, // Backend sẽ chuyển sang String nếu Model là String

      // --- Thông tin VNPay (Backend sẽ dùng để tạo URL) ---
      amount: course.pricing,
      orderInfo: `Thanh toan khoa hoc: ${course.title}`,
      vnp_TxnRef: "ORDER_" + Date.now(), // Mã tham chiếu tạm thời

      // --- Metadata cho DB (Backend sẽ override các trường này) ---
      orderStatus: "pending",
      paymentMethod: "vnpay",
    };

    console.log("Payload thanh toán chuẩn bị gửi lên Backend:", paymentPayload);

    // 3. Gọi API Backend
    try {
      // 💡 Sử dụng hàm service đã sửa (nếu bạn dùng nó)
      const response = await createPaymentService(paymentPayload);
      if (response.success && response.data?.vnpayUrl) {
        const { vnpayUrl, orderId } = response.data;

        // 4. Lưu Order ID (ID được tạo/xác nhận từ Backend)
        sessionStorage.setItem("currentOrderId", orderId); // Lưu string thay vì JSON.stringify

        // 5. Chuyển hướng người dùng sang Cổng VNPay
        window.location.href = vnpayUrl;
      } else {
        // Xử lý trường hợp API Backend thành công nhưng thiếu URL
        alert(
          "Lỗi: Backend không trả về URL thanh toán VNPay hợp lệ. " +
            (response.message || "")
        );
      }
    } catch (error) {
      console.error("Lỗi khi tạo yêu cầu VNPay:", error);
      // Xử lý lỗi kết nối hoặc lỗi server 500
      alert(
        "Đã xảy ra lỗi hệ thống khi tạo yêu cầu thanh toán. Vui lòng thử lại."
      );
    }
  }

  useEffect(() => {
    if (displayCurrentVideoFreePreview !== null) setShowFreePreviewDialog(true);
  }, [displayCurrentVideoFreePreview]);

  useEffect(() => {
    if (currentCourseDetailsId !== null) fetchStudentViewCourseDetails();
  }, [currentCourseDetailsId]);

  useEffect(() => {
    if (id) setCurrentCourseDetailsId(id);
  }, [id]);

  useEffect(() => {
    if (!location.pathname.includes("course/details"))
      setStudentViewCourseDetails(null),
        setCurrentCourseDetailsId(null),
        setCoursePurchaseId(null);
  }, [location.pathname]);

  if (loadingState) return <Skeleton />;

  if (approvalUrl !== "") {
    window.location.href = approvalUrl;
  }

  const getIndexOfFreePreviewUrl =
    studentViewCourseDetails !== null
      ? studentViewCourseDetails?.curriculum?.findIndex(
          (item) => item.freePreview
        )
      : -1;

  return (
    <div className=" mx-auto p-4">
      <div className="bg-gray-900 text-white p-8 rounded-t-lg">
        <h1 className="text-3xl font-bold mb-4">
          {studentViewCourseDetails?.title}
        </h1>
        <p className="text-xl mb-4">{studentViewCourseDetails?.subtitle}</p>
        <div className="flex items-center space-x-4 mt-2 text-sm">
          <span>Created By {studentViewCourseDetails?.instructorName}</span>
          <span>Created On {studentViewCourseDetails?.date.split("T")[0]}</span>
          <span className="flex items-center">
            <Globe className="mr-1 h-4 w-4" />
            {studentViewCourseDetails?.primaryLanguage}
          </span>
          <span>
            {studentViewCourseDetails?.students.length}{" "}
            {studentViewCourseDetails?.students.length <= 1
              ? "Student"
              : "Students"}
          </span>
        </div>
      </div>
      <div className="flex flex-col md:flex-row gap-8 mt-8">
        <main className="flex-grow">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>What you'll learn</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {studentViewCourseDetails?.objectives
                  .split(",")
                  .map((objective, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="mr-2 h-5 w-5 text-green-500 flex-shrink-0" />
                      <span>{objective}</span>
                    </li>
                  ))}
              </ul>
            </CardContent>
          </Card>
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Course Description</CardTitle>
            </CardHeader>
            <CardContent>{studentViewCourseDetails?.description}</CardContent>
          </Card>
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Course Curriculum</CardTitle>
            </CardHeader>
            <CardContent>
              {studentViewCourseDetails?.curriculum?.map(
                (curriculumItem, index) => (
                  <li
                    className={`${
                      curriculumItem?.freePreview
                        ? "cursor-pointer"
                        : "cursor-not-allowed"
                    } flex items-center mb-4`}
                    onClick={
                      curriculumItem?.freePreview
                        ? () => handleSetFreePreview(curriculumItem)
                        : null
                    }
                  >
                    {curriculumItem?.freePreview ? (
                      <PlayCircle className="mr-2 h-4 w-4" />
                    ) : (
                      <Lock className="mr-2 h-4 w-4" />
                    )}
                    <span>{curriculumItem?.title}</span>
                  </li>
                )
              )}
            </CardContent>
          </Card>
        </main>
        <aside className="w-full md:w-[500px]">
          <Card className="sticky top-4">
            <CardContent className="p-6">
              <div className="aspect-video mb-4 rounded-lg flex items-center justify-center">
                <VideoPlayer
                  url={
                    getIndexOfFreePreviewUrl !== -1
                      ? studentViewCourseDetails?.curriculum[
                          getIndexOfFreePreviewUrl
                        ].videoUrl
                      : ""
                  }
                  width="450px"
                  height="200px"
                />
              </div>
              <div className="mb-4">
                <span className="text-3xl font-bold">
                  {formatCurrencyVND(studentViewCourseDetails?.pricing)}
                </span>
              </div>
              <Button onClick={handleCreatePayment} className="w-full">
                Buy Now
              </Button>
            </CardContent>
          </Card>
        </aside>
      </div>
      <Dialog
        open={showFreePreviewDialog}
        onOpenChange={() => {
          setShowFreePreviewDialog(false);
          setDisplayCurrentVideoFreePreview(null);
        }}
      >
        <DialogContent className="w-[800px]">
          <DialogHeader>
            <DialogTitle>Course Preview</DialogTitle>
          </DialogHeader>
          <div className="aspect-video rounded-lg flex items-center justify-center">
            <VideoPlayer
              url={displayCurrentVideoFreePreview}
              width="450px"
              height="200px"
            />
          </div>
          <div className="flex flex-col gap-2">
            {studentViewCourseDetails?.curriculum
              ?.filter((item) => item.freePreview)
              .map((filteredItem) => (
                <p
                  onClick={() => handleSetFreePreview(filteredItem)}
                  className="cursor-pointer text-[16px] font-medium"
                >
                  {filteredItem?.title}
                </p>
              ))}
          </div>
          <DialogFooter className="sm:justify-start">
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Close
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default StudentViewCourseDetailsPage;
