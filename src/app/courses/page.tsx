"use client"
import React, { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  PiStarFill,
  PiUsers,
  PiClock,
  PiChalkboardTeacher,
  PiFunnel,
  PiMagnifyingGlass,
  PiBookOpen
} from "react-icons/pi"
import Paginator from "./Component/Paginator"

// Course interface
interface Course {
  id: string;
  _id: string;
  course: {
    courseName: string;
    courseDurationInDays: number;
    courseLevel: string;
  };
  courseCategories: {
    courseCategory: string;
    courseSubCategory: string;
    trendingScore: number;
  };
  courseInstructors: {
    id: string;
    _id: string;
    profile_details: {
      fullName: string;
      avatarUrl: string;
    };
  }[];
  coursePricingAndOffers: {
    courseFeeStructure: number;
    isCourseOnOffer: boolean;
  };
  courseSEOAndMarketing: {
    courseBannerUrl: string;
  };
  enrollmentStatus: {
    courseStatus: string;
  };
}

export default function CoursePage(): React.ReactElement {
  const [totalPages, setTotalPages] = useState<number>(1)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [filter, setFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [searchType, setSearchType] = useState<"title" | "instructor" | "tag">("title")
  const [courses, setCourses] = useState<Course[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch courses from server
  const fetchCourses = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/courses/all")
      if (!response.ok) {
        throw new Error("Failed to fetch courses")
      }
      const data = await response.json()
      setCourses(data?.data)
      setTotalPages(data.totalPages)
    } catch (err) {
      console.error("Using mock data due to:", err)
      setTotalPages(3)
      setError("Couldn't connect to server. Showing sample data.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCourses()
  }, [currentPage, filter, searchType])

  const onPaginatorChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchCourses()
  }

  // Map course category to type (adjust as needed)
  const getCourseType = (category: string) => {
    const categoryLower = category.toLowerCase();
    if (categoryLower.includes("data science")) return "online";
    if (categoryLower.includes("offline")) return "offline";
    if (categoryLower.includes("free")) return "free";
    return "online"; // Default
  }

  return (
    <div className="min-h-screen py-8 gap-12 flex items-start justify-center bg-gradient-to-br from-orange-200 via-orange-300 to-orange-400 dark:from-stone-800 dark:via-stone-900 dark:to-black">
      <div className="container mx-auto px-4 py-8">
        {/* Header with create buttons */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold text-stone-800">Course Management</h1>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/courses/create-online-course"
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <PiChalkboardTeacher size={18} />
              Create Online Course
            </Link>
            <Link
              href="/courses/create-offline-course"
              className="bg-stone-600 hover:bg-stone-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <PiChalkboardTeacher size={18} />
              Create Offline Course
            </Link>
            <Link
              href="/courses/create-free-course"
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <PiChalkboardTeacher size={18} />
              Create Free Course
            </Link>
          </div>
        </div>

        {/* Filters and search */}
        <div className="bg-stone-50 rounded-xl p-4 mb-8">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-2 w-full md:w-auto">
              <PiFunnel className="text-orange-500" size={20} />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="bg-white border border-stone-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="all">All Courses</option>
                <option value="online">Online Courses</option>
                <option value="offline">Offline Courses</option>
                <option value="free">Free Courses</option>
                <option value="beginner">Beginner Level</option>
                <option value="intermediate">Intermediate Level</option>
                <option value="advanced">Advanced Level</option>
              </select>
            </div>

            <div className="flex flex-col md:flex-row gap-3 w-full">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder={`Search by ${searchType}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <div className="absolute left-3 top-2.5 text-stone-400">
                  <PiMagnifyingGlass size={18} />
                </div>
              </div>

              <select
                value={searchType}
                onChange={(e) => setSearchType(e.target.value as any)}
                className="bg-white border border-stone-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="title">Course Title</option>
                <option value="instructor">Instructor</option>
                <option value="tag">Tag</option>
              </select>

              <button
                type="submit"
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                <PiMagnifyingGlass size={18} />
                Search
              </button>
            </div>
          </form>

          <div className="flex flex-wrap gap-4 mt-4">
            <button
              onClick={() => {
                setFilter("all")
                setSearchType("title")
                setSearchQuery("")
              }}
              className={`px-3 py-1 rounded-full text-sm flex items-center gap-1 ${filter === "all" && !searchQuery ? "bg-orange-500 text-white" : "bg-stone-200 text-stone-700"}`}
            >
              <PiUsers size={16} />
              All Courses
            </button>
            <button
              onClick={() => setFilter("online")}
              className={`px-3 py-1 rounded-full text-sm flex items-center gap-1 ${filter === "online" ? "bg-orange-500 text-white" : "bg-stone-200 text-stone-700"}`}
            >
              <PiStarFill size={16} />
              Online Courses
            </button>
            <button
              onClick={() => setFilter("free")}
              className={`px-3 py-1 rounded-full text-sm flex items-center gap-1 ${filter === "free" ? "bg-orange-500 text-white" : "bg-stone-200 text-stone-700"}`}
            >
              <PiBookOpen size={16} />
              Free Courses
            </button>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-6">
            <div className="flex items-center gap-2 text-amber-700">
              <PiBookOpen size={20} />
              <p>{error}</p>
            </div>
          </div>
        )}

        {/* Loading state */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
          </div>
        ) : (
          <>
            {/* Course Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {courses.map((course) => {
                const durationInMonths = Math.floor(course.course.courseDurationInDays / 30);
                const remainingDays = course.course.courseDurationInDays % 30;
                const durationText = `${durationInMonths > 0 ? `${durationInMonths} month${durationInMonths > 1 ? 's' : ''}` : ''} ${remainingDays > 0 ? `${remainingDays} day${remainingDays > 1 ? 's' : ''}` : ''}`.trim();
                const primaryInstructor = course.courseInstructors[0]?.profile_details;
                const courseType = getCourseType(course.courseCategories.courseCategory);

                return (
                  <Link
                    key={course.id || course._id}
                    className="relative bg-gradient-to-br from-stone-800 to-stone-900 rounded-xl overflow-hidden shadow-xl max-w-md transform hover:scale-105 transition-all duration-300 cursor-pointer border border-orange-500/30"
                    href={`/courses/${course._id}?type=${courseType}&ref=course-management`}
                  >
                    {/* Banner Image */}
                    <div className="relative">
                      <img
                        className="w-full h-48 object-cover opacity-90"
                        src={course.courseSEOAndMarketing.courseBannerUrl}
                        alt={`${course.course.courseName} banner`}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-stone-900/70 to-transparent"></div>
                      <span className="absolute top-3 left-3 bg-orange-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                        {course.enrollmentStatus.courseStatus}
                      </span>
                      <span className="absolute top-3 right-3 bg-stone-700 text-orange-300 text-xs font-semibold px-3 py-1 rounded-full">
                        {course.courseCategories.courseCategory}
                      </span>
                    </div>

                    {/* Card Content */}
                    <div className="p-5">
                      {/* Course Name and Price */}
                      <div className="flex justify-between items-center mb-2">
                        <h2 className="text-lg font-bold text-orange-300 line-clamp-2">{course.course.courseName}</h2>
                        <p className="text-lg font-semibold text-orange-400">
                          ₹{course.coursePricingAndOffers.courseFeeStructure}
                          {course.coursePricingAndOffers.isCourseOnOffer && (
                            <span className="text-green-400 text-xs ml-1">On Offer</span>
                          )}
                        </p>
                      </div>

                      {/* Subcategory */}
                      <p className="text-stone-400 text-sm mb-3">
                        {course.courseCategories.courseSubCategory}
                      </p>

                      {/* Level, Duration, Trending Score */}
                      <div className="flex items-center gap-4 mb-3">
                        <div className="flex items-center">
                          <p className="text-stone-500 text-xs mr-1">Level:</p>
                          <p className="text-stone-300 text-sm">{course.course.courseLevel}</p>
                        </div>
                        <div className="flex items-center">
                          <p className="text-stone-500 text-xs mr-1">Duration:</p>
                          <p className="text-stone-300 text-sm">{durationText}</p>
                        </div>
                        <div className="flex items-center">
                          <PiStarFill className="text-orange-500 mr-1" size={14} />
                          <p className="text-stone-300 text-sm">{course.courseCategories.trendingScore}</p>
                        </div>
                      </div>

                      {/* Instructor */}
                      <div className="flex items-center pt-3 border-t border-stone-700">
                        <img
                          className="w-8 h-8 rounded-full mr-2 border border-orange-500"
                          src={primaryInstructor?.avatarUrl}
                          alt={`${primaryInstructor?.fullName} avatar`}
                        />
                        <p className="text-stone-300 text-sm">{primaryInstructor?.fullName}</p>
                      </div>
                    </div>

                    {/* Hover Effect Overlay */}
                    <div className="absolute inset-0 opacity-0 hover:opacity-100 bg-orange-500/10 transition-opacity duration-300 flex items-center justify-center">
                      <p className="text-orange-300 font-semibold">View Course</p>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Empty state */}
            {courses.length === 0 && !isLoading && (
              <div className="text-center py-12">
                <PiBookOpen className="mx-auto text-stone-400" size={48} />
                <h3 className="mt-4 text-lg font-medium text-stone-800">No courses found</h3>
                <p className="mt-1 text-stone-500">Try adjusting your search or filter criteria</p>
              </div>
            )}

            {/* Pagination */}
            {courses.length > 0 && (
              <div className="flex justify-center">
                <Paginator
                  pages={totalPages}
                  onPageClick={onPaginatorChange}
                  currentPage={currentPage}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}