import { courseCategories } from "../../../config";
import banner from "../../../../public/banner-img.png";
import { Button } from "../../../components/ui/button.jsx";
import { useContext, useEffect, useState } from "react";
import { StudentContext } from "../../../context/student-context";
import {
  checkCoursePurchaseInfoService,
  fetchStudentViewCourseListService,
} from "../../../services";
import { AuthContext } from "../../../context/auth-context";
import { useNavigate } from "react-router-dom";
import { formatCurrencyVND } from "../../../utils/currencyFormatter.js";
import { getListCategory } from "../../../services";
import { Skeleton } from "../../../components/ui/skeleton.jsx";

function StudentHomePage() {
  const { studentViewCoursesList, setStudentViewCoursesList } =
    useContext(StudentContext);
  const { auth } = useContext(AuthContext);
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  function handleNavigateToCoursesPage(categoryItem) {
    
    sessionStorage.removeItem("filters");
    const currentFilter = {
      category: [categoryItem.slug],
    };
    console.log(currentFilter,categoryItem)
    sessionStorage.setItem("filters", JSON.stringify(currentFilter));
    navigate("/courses");
  }

  async function fetchAllStudentViewCourses() {
    const response = await fetchStudentViewCourseListService();
    console.log(response);
    
    if (response?.success) setStudentViewCoursesList(response?.data);
  }

  async function handleCourseNavigate(getCurrentCourseId) {
    const response = await checkCoursePurchaseInfoService(
      getCurrentCourseId,
      auth?.user?._id
    );

    if (response?.success) {
      if (response?.data) {
        console.log("Navigate to course progress");
        navigate(`/course-progress/${getCurrentCourseId}`);
      } else {
        navigate(`/course/details/${getCurrentCourseId}`);
      }
    }
  }

  useEffect(() => {
    fetchAllStudentViewCourses();
  }, []);

  useEffect(() => {
    async function loadCategories() {
      try {
        setCategoriesLoading(true);
        const response = await getListCategory();
        if (Array.isArray(response)) {
          const mapped = response.map((c) => ({
            id: c._id,
            label: c.name,
            slug: c.slug,
          }));
          setCategories(mapped);
        }
      } catch (err) {
      } finally {
        setCategoriesLoading(false);
      }
    }

    loadCategories();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <section className="flex flex-col lg:flex-row items-center justify-between py-8 px-4 lg:px-8">
        <div className="lg:w-1/2 lg:pr-12">
          <h1 className="text-4xl font-bold mb-4">Learning thet gets you</h1>
          <p className="text-xl">
            Skills for your present and your future. Get Started with US
          </p>
        </div>
        <div className="lg:w-full mb-8 lg:mb-0">
          <img
            src={banner}
            width={600}
            height={400}
            className="w-full h-auto rounded-lg shadow-lg"
          />
        </div>
      </section>
      <section className="py-8 px-4 lg:px-8 bg-gray-100">
        <h2 className="text-2xl font-bold mb-6">Course Categories</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {categoriesLoading ? (
            <Skeleton className="h-10 w-full col-span-4" />
          ) : (
            (categories.length ? categories : courseCategories).map(
              (categoryItem) => (
                <Button
                  className="justify-start"
                  variant="outline"
                  key={categoryItem.id}
                  onClick={() => handleNavigateToCoursesPage(categoryItem)}
                >
                  {categoryItem.label}
                </Button>
              )
            )
          )}
        </div>
      </section>
      <section className="py-12 px-4 lg:px-8">
        <h2 className="text-2xl font-bold mb-6">Featured Courses</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {studentViewCoursesList && studentViewCoursesList.length > 0 ? (
            studentViewCoursesList.map((courseItem) => (
              <div
                key={courseItem?._id}
                onClick={() => handleCourseNavigate(courseItem?._id)}
                className="border rounded-lg overflow-hidden shadow cursor-pointer"
              >
                <img
                  src={courseItem?.image}
                  width={300}
                  height={150}
                  className="w-full h-40 object-cover"
                />
                <div className="p-4">
                  <h3 className="font-bold mb-2">{courseItem?.title}</h3>
                  <p className="text-sm text-gray-700 mb-2">
                    {courseItem?.instructorName}
                  </p>
                  <p className="font-bold text-[16px]">
                    {formatCurrencyVND(courseItem?.pricing)}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <h1>No Courses Found</h1>
          )}
        </div>
      </section>
    </div>
  );
}

export default StudentHomePage;
