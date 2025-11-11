import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { filterOptions, sortOptions } from "@/config";
import { AuthContext } from "@/context/auth-context";
import { StudentContext } from "@/context/student-context";
import {
  checkCoursePurchaseInfoService,
  fetchStudentViewCourseListService,
  getListCategory,
} from "@/services";
import { ArrowUpDownIcon, Search, X, Loader } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { formatCurrencyVND } from "@/utils/currencyFormatter";


function StudentViewCoursesPage() {
  const [sort, setSort] = useState("price-lowtohigh");
  const [filters, setFilters] = useState({});
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const {
    studentViewCoursesList,
    setStudentViewCoursesList,
    loadingState,
    setLoadingState,
  } = useContext(StudentContext);
  const navigate = useNavigate();
  const { auth } = useContext(AuthContext);

  function handleFilterOnChange(getSectionId, getCurrentOption) {
    let cpyFilters = { ...filters };
    const valueToUse = getCurrentOption.slug || getCurrentOption.id;
    const indexOfCurrentSeection = Object.keys(cpyFilters).indexOf(getSectionId);

    if (indexOfCurrentSeection === -1) {
      cpyFilters = { ...cpyFilters, [getSectionId]: [valueToUse] };
    } else {
      const indexOfCurrentOption = cpyFilters[getSectionId].indexOf(valueToUse);
      if (indexOfCurrentOption === -1) cpyFilters[getSectionId].push(valueToUse);
      else cpyFilters[getSectionId].splice(indexOfCurrentOption, 1);
    }
    setFilters(cpyFilters);
    sessionStorage.setItem("filters", JSON.stringify(cpyFilters));
  }

  async function fetchAllStudentViewCourses(filters, sort, search = "") {
    setLoadingState(true);
    const query = new URLSearchParams({
      ...filters,
      sortBy: sort,
      ...(search ? { search } : {}),
    });
    const response = await fetchStudentViewCourseListService(query);
    if (response?.success) {
      setStudentViewCoursesList(response?.data);
    } else {
      setStudentViewCoursesList([]);
    }
    setLoadingState(false);
  }

  async function handleCourseNavigate(getCurrentCourseId) {
    const response = await checkCoursePurchaseInfoService(
      getCurrentCourseId,
      auth?.user?._id
    );

    if (response?.success) {
      if (response?.data) {
        navigate(`/course-progress/${getCurrentCourseId}`);
      } else {
        navigate(`/course/details/${getCurrentCourseId}`);
      }
    }
  }

  useEffect(() => {
    setSort("price-lowtohigh");
    setFilters(JSON.parse(sessionStorage.getItem("filters")) || {});
  }, []);

  useEffect(() => {
    if (filters !== null && sort !== null) {
      fetchAllStudentViewCourses(filters, sort, searchQuery);
    }
  }, [filters, sort]);

  useEffect(() => {
    return () => {
      if (searchTimeout) clearTimeout(searchTimeout);
    };
  }, [searchTimeout]);

  useEffect(() => {
    return () => {
      sessionStorage.removeItem("filters");
    };
  }, []);

  useEffect(() => {
    async function loadCategories() {
      try {
        setCategoriesLoading(true);
        const response = await getListCategory();
        let categoriesData = [];
        if (Array.isArray(response)) categoriesData = response;
        else if (response?.data && Array.isArray(response.data)) categoriesData = response.data;
        const mapped = categoriesData.map((c) => ({ id: c._id, label: c.name, slug: c.slug }));
        setCategories(mapped);
      } catch (err) {
        console.error("Error fetching categories", err);
      } finally {
        setCategoriesLoading(false);
      }
    }
    loadCategories();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">All Courses</h1>
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Search courses, topics or instructors..."
            value={searchQuery}
            onChange={(e) => {
              const value = e.target.value;
              setSearchQuery(value);
              if (searchTimeout) clearTimeout(searchTimeout);
              const timeoutId = setTimeout(async () => {
                try {
                  setIsSearching(true);
                  await fetchAllStudentViewCourses(filters, sort, value);
                } finally {
                  setIsSearching(false);
                }
              }, 500);
              setSearchTimeout(timeoutId);
            }}
            className="w-full pl-10 pr-10"
          />
          {searchQuery && (
            <button
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              onClick={() => {
                if (searchTimeout) clearTimeout(searchTimeout);
                setSearchQuery("");
                fetchAllStudentViewCourses(filters, sort, "");
              }}
            >
              <X className="h-4 w-4" />
            </button>
          )}
          {isSearching && (
            <div className="absolute right-9 top-1/2 -translate-y-1/2 text-gray-500">
              <Loader className="h-4 w-4 animate-spin" />
            </div>
          )}
        </div>
      </div>
      <div className="flex flex-col md:flex-row gap-4">
        <aside className="w-full md:w-64 space-y-4">
          <div>
            {Object.keys(filterOptions).map((keyItem) => (
              <div className="p-4 border-b" key={keyItem}>
                <h3 className="font-bold mb-3">{keyItem.toUpperCase()}</h3>     
                <div className="grid gap-2 mt-2">
                  {keyItem === "category" ? (
                    categoriesLoading ? (
                      <Skeleton className="h-10 w-full" />
                    ) : categories.length > 0 ? (
                      categories.map((option) => (
                        <Label
                          key={option.slug}
                          className="flex font-medium items-center gap-3"
                        >
                          <Checkbox
                            checked={
                              filters &&
                              filters[keyItem] &&
                              filters[keyItem].indexOf(option.slug) > -1
                            }
                            onCheckedChange={() =>
                              handleFilterOnChange(keyItem, option)
                            }
                          />
                          {option.label}             
                        </Label>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">
                        No categories found.
                      </p>
                    )
                  ) : (
                    filterOptions[keyItem].map((option) => (
                      <Label
                        key={option.id}
                        className="flex font-medium items-center gap-3"
                      >
                        <Checkbox
                          checked={
                            filters &&
                            filters[keyItem] &&
                            filters[keyItem].indexOf(option.id) > -1
                          }
                          onCheckedChange={() =>
                            handleFilterOnChange(keyItem, option)
                          }
                        />
                                                {option.label}                 
                      </Label>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        </aside>
        {/* === MAIN CONTENT === */}
        <main className="flex-1">
                <div className="flex justify-end items-center mb-4 gap-5">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 p-5"
                >
                  <ArrowUpDownIcon className="h-4 w-4" />
                  <span className="text-[16px] font-medium">Sort By</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[180px]">
                <DropdownMenuRadioGroup
                  value={sort}
                  onValueChange={(value) => setSort(value)}
                >
                  {sortOptions.map((sortItem) => (
                    <DropdownMenuRadioItem
                      value={sortItem.id}
                      key={sortItem.id}
                    >
                      {sortItem.label}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            <span className="text-sm text-black font-bold">{studentViewCoursesList.length} Results</span>
          </div>
          <div className="space-y-4">
            {loadingState ? (
              [...Array(3)].map((_, index) => (
                <Card key={index} className="p-4">
                  <CardContent className="flex gap-4 p-0">
                    <Skeleton className="w-48 h-32 flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-5 w-1/4" />
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : studentViewCoursesList && studentViewCoursesList.length > 0 ? (
              studentViewCoursesList.map((courseItem) => (
                <Card onClick={() => handleCourseNavigate(courseItem?._id)} className="cursor-pointer" key={courseItem?._id}>
                  <CardContent className="flex gap-4 p-4">
                    <div className="w-48 h-32 flex-shrink-0">
                      <img src={courseItem?.image} className="w-full h-full object-cover rounded" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">{courseItem?.title}</CardTitle>
                      <p className="text-sm text-gray-600 mb-1">
                        Created By <span className="font-bold">{courseItem?.instructorName}</span>
                      </p>
                      <p className="text-[16px] text-gray-600 mt-3 mb-2">
                        {`${courseItem?.curriculum?.length} ${courseItem?.curriculum?.length <= 1 ? "Lecture" : "Lectures"} - ${courseItem?.level.toUpperCase()} Level`}
                      </p>
                      <p className="font-bold text-lg text-primary">{formatCurrencyVND(courseItem?.pricing)}</p>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <h1 className="font-extrabold text-4xl text-center mt-10 text-gray-700">No Courses Found</h1>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default StudentViewCoursesPage;
