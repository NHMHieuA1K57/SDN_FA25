import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { AuthContext } from "@/context/auth-context";
import { StudentContext } from "@/context/student-context";
import { fetchStudentBoughtCoursesService } from "@/services";
import { Watch } from "lucide-react";
import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function StudentCoursesPage() {
  const { auth } = useContext(AuthContext);
  const { studentBoughtCoursesList, setStudentBoughtCoursesList } =
    useContext(StudentContext);
  const navigate = useNavigate();

  async function fetchStudentBoughtCourses() {
    const response = await fetchStudentBoughtCoursesService(auth?.user?._id);
    if (response?.success) {
      setStudentBoughtCoursesList(response?.data);
    }
  }
  useEffect(() => {
    fetchStudentBoughtCourses();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-8">My Courses</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {studentBoughtCoursesList && studentBoughtCoursesList.length > 0 ? (
          studentBoughtCoursesList.map((course) => (
            <Card key={course._id || course.courseId} className="flex flex-col">
              <CardContent className="p-4 flex-grow">
                <img
                  src={course?.courseImage}
                  alt={course?.title}
                  className="h-52 w-full object-cover rounded-md mb-4"
                />
                <h3 className="font-bold mb-1">{course?.title}</h3>
                <p className="text-sm text-gray-700 mb-2">
                  Instructor: {course?.instructorId || "Unknown"}
                </p>
                {course?.dateOfPurchase && (
                  <p className="text-xs text-gray-400">
                    Purchased on:{" "}
                    {new Date(course.dateOfPurchase).toLocaleDateString()}
                  </p>
                )}
              </CardContent>
              <CardFooter>
                <Button
                  onClick={() =>
                    navigate(
                      `/course-progress/${course?.courseId || course?._id}`
                    )
                  }
                  className="flex-1"
                >
                  Start Watching
                </Button>
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="col-span-1 md:col-span-3 lg:col-span-4">
            <div className="flex items-center justify-center h-64">
              <div className="text-center p-8 bg-white border border-gray-100 rounded-lg shadow-md w-full max-w-xl">
                <div className="flex items-center justify-center mb-4">
                  <div className="bg-indigo-50 text-indigo-600 rounded-full p-4">
                    <Watch className="w-10 h-10" />
                  </div>
                </div>
                <h2 className="text-2xl font-semibold mb-2">
                  You don't have any courses yet
                </h2>
                <p className="text-sm text-gray-500 mb-6">
                  Explore our catalog to find courses you love. After purchase,
                  your courses will appear here so you can start learning right
                  away.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    onClick={() => navigate("/courses")}
                    variant="outline"
                    className="text-gray-700"
                  >
                    Explore Courses
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default StudentCoursesPage;
