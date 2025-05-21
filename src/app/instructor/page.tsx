"use client";
import { useCallback, useEffect, useState } from "react";
import { usePopupContext } from "../Context/ToastProvider";
import { debounce } from "lodash";
import Link from "next/link";
import { Types } from "mongoose";
import { PiCheck, PiTrash, PiWarning, PiMagnifyingGlass } from "react-icons/pi";
import { TfiSave } from "react-icons/tfi";
import { FaRegEdit } from "react-icons/fa";
import { TiCancel, TiTick } from "react-icons/ti";
import { FiChevronLeft, FiChevronRight, FiMoreVertical } from "react-icons/fi";
import { IoClose } from "react-icons/io5";

interface Instructor {
  _id: string;
  username: string;
  email?: string;
  phone?: string;
  role: "super_instructor" | "instructor" | "support" | "manager";
  status: "working" | "inactive" | "suspended" | "unverified";
  connectionStatus?: "online" | "offline" | "away";
  isSuperAdmin?: boolean;
  profile_details: Types.ObjectId;
}

const roleOptions = [
  { value: "super_instructor", label: "Super Instructor" },
  { value: "instructor", label: "Instructor" },
  { value: "support", label: "Support" },
  { value: "manager", label: "Manager" },
];

const statusOptions = [
  { value: "working", label: "Working" },
  { value: "inactive", label: "Inactive" },
  { value: "suspended", label: "Suspended" },
  { value: "unverified", label: "Unverified" },
];

export default function InstructorsManagementPage() {
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Instructor>>({});
  const [currentUserRole, setCurrentUserRole] = useState<string>("");
  const { Popup } = usePopupContext();
  const toast = Popup();
  const itemsPerPage = 8;

  // Debounced search handler
  const debouncedSearch = useCallback(
    debounce((value: string) => {
      setSearchTerm(value);
      setCurrentPage(1);
    }, 300),
    []
  );

  const fetchAllInstructors = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(
        `/api/admins?search=${encodeURIComponent(
          searchTerm
        )}&page=${currentPage}&limit=${itemsPerPage}&sort=username`,
        {
          credentials: "include",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch instructors");
      }

      const data = await response.json();
      setInstructors(data.admins);
      setCurrentUserRole(data.currentUserRole);
    } catch (error) {
      console.error(error);
      setError(error instanceof Error ? error.message : "An unknown error occurred");
      toast.error("Failed to load instructors");
    } finally {
      setLoading(false);
    }
  }, [searchTerm, currentPage, itemsPerPage]);

  useEffect(() => {
    fetchAllInstructors();
  }, [fetchAllInstructors]);

  const handleEditClick = (instructor: Instructor) => {
    if (instructor.isSuperAdmin && currentUserRole !== "super_instructor") {
      toast.error("Only Super Admin can modify this account");
      return;
    }
    setEditingId(instructor._id);
    setEditForm({
      role: instructor.role,
      status: instructor.status,
    });
  };

  const handleUpdate = async (id: string) => {
    try {
      const instructor = instructors.find((i) => i._id === id);
      if (instructor?.isSuperAdmin && currentUserRole !== "super_instructor") {
        throw new Error("Unauthorized to modify Super Admin");
      }

      const response = await fetch(`/api/admins`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ ...editForm, instructorId: instructor?._id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update instructor");
      }

      setInstructors(
        instructors.map((inst) =>
          inst._id === id ? { ...inst, ...editForm } : inst
        )
      );
      setEditingId(null);
      toast.success("Instructor updated successfully");
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : "Update failed";
      setError(message);
      toast.error(message);
    }
  };

  const handleDeleteClick = async (instructor: Instructor) => {
    try {
      const response = await fetch(`/api/instructor/${instructor._id}`,{
        method:"DELETE",
        credentials:"include"
      })
      if(!response.ok){
        toast.error("Failed To Delete Instuctor")
        return
      }
      const {instructorId} = await response.json()
      // console.log(instructorId)
      const newInstructors = instructors.filter((ins) => ins._id !== instructorId)
      setInstructors(newInstructors)
      toast.success("Instructor Deleted Successfully")
    } catch (error) {
      console.log(error)
      toast.error("Failed To Create Instructor")
      return
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-emerald-500";
      case "away":
        return "bg-amber-500";
      case "offline":
        return "bg-stone-400";
      case "working":
        return "bg-orange-500";
      case "suspended":
        return "bg-rose-500";
      default:
        return "bg-stone-300";
    }
  };

  const filteredInstructors = instructors.filter(
    (instructor) =>
      instructor.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      instructor.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      instructor.phone?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedInstructors = filteredInstructors.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredInstructors.length / itemsPerPage);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-stone-50 to-stone-100 dark:from-stone-900 dark:to-stone-800">
        <div className="text-center space-y-6">
          <div className="relative w-24 h-24 mx-auto">
            <div className="absolute inset-0 border-4 border-t-orange-500 border-stone-300 dark:border-stone-700 rounded-full animate-spin"></div>
            <div className="absolute inset-0 opacity-75 border-4 border-t-orange-400 border-stone-200 dark:border-stone-800 rounded-full animate-spin animate-reverse"></div>
            <div className="absolute inset-4 flex items-center justify-center">
              <span className="text-orange-500 text-2xl font-bold animate-pulse">AP</span>
            </div>
          </div>
          <p className="text-stone-600 dark:text-stone-300">Loading instructor data...</p>
          <div className="flex justify-center gap-2">
            {[0, 0.2, 0.4].map((delay) => (
              <span
                key={delay}
                className="w-2 h-2 bg-orange-500 rounded-full animate-bounce"
                style={{ animationDelay: `${delay}s` }}
              ></span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-stone-50 to-stone-100 dark:from-stone-900 dark:to-stone-800">
        <div className="max-w-md p-6 bg-white dark:bg-stone-800 rounded-xl shadow-lg text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-orange-100 dark:bg-orange-900/50 flex items-center justify-center">
            <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-stone-800 dark:text-white mb-2">Error Loading Data</h2>
          <p className="text-stone-600 dark:text-stone-300 mb-4">{error}</p>
          <button
            onClick={fetchAllInstructors}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-16 flex items-center justify-center bg-gradient-to-br from-orange-200 via-orange-300 to-orange-400 dark:from-stone-800 dark:via-stone-900 dark:to-black">
      <div className=" mx-auto w-full px-16 flex items-center justify-center flex-col">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center w-full gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-stone-900 dark:text-white">Instructor Management</h1>
            <p className="text-stone-500 dark:text-stone-400 mt-1">
              Manage all instructor accounts and permissions
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-72">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <PiMagnifyingGlass className="h-5 w-5 text-stone-400" />
            </div>
            <input
              type="text"
              placeholder="Search instructors..."
              className="block w-full pl-10 pr-3 py-2.5 border border-stone-200 dark:border-stone-700 rounded-lg bg-white dark:bg-stone-800 text-stone-900 dark:text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              onChange={(e) => debouncedSearch(e.target.value)}
              aria-label="Search instructors"
            />
          </div>
        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 w-full lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-stone-800 rounded-xl shadow-sm p-6 border border-stone-100 dark:border-stone-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-stone-500 dark:text-stone-400">Total Instructors</p>
                <p className="text-2xl font-semibold text-stone-900 dark:text-white">{instructors.length}</p>
              </div>
              <div className="p-3 rounded-lg bg-orange-50 dark:bg-orange-900/20">
                <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-stone-800 rounded-xl shadow-sm p-6 border border-stone-100 dark:border-stone-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-stone-500 dark:text-stone-400">Active</p>
                <p className="text-2xl font-semibold text-stone-900 dark:text-white">
                  {instructors.filter(i => i.status === "working").length}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
                <svg className="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-stone-800 rounded-xl shadow-sm p-6 border border-stone-100 dark:border-stone-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-stone-500 dark:text-stone-400">Online Now</p>
                <p className="text-2xl font-semibold text-stone-900 dark:text-white">
                  {instructors.filter(i => i.connectionStatus === "online").length}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
                <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                  <span className="w-2 h-2 bg-white rounded-full"></span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-stone-800 rounded-xl shadow-sm p-6 border border-stone-100 dark:border-stone-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-stone-500 dark:text-stone-400">Need Attention</p>
                <p className="text-2xl font-semibold text-stone-900 dark:text-white">
                  {instructors.filter(i => i.status === "suspended" || i.status === "unverified").length}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20">
                <svg className="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Main Table */}
        <div className="bg-white dark:bg-stone-800 w-full rounded-xl shadow-sm overflow-hidden border border-stone-100 dark:border-stone-700">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-stone-200 dark:divide-stone-700">
              <thead className="bg-stone-50 dark:bg-stone-700/30">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                    Instructor
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                    Contact
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                    Profile
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                    Role
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 dark:divide-stone-700">
                {paginatedInstructors.map((instructor) => (
                  <tr
                    key={instructor._id}
                    className={`hover:bg-stone-50 dark:hover:bg-stone-700/20 transition-colors ${instructor.isSuperAdmin ? "bg-orange-50/30 dark:bg-orange-900/10" : ""}`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link href={`/instructor/${instructor._id}`} className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/30 flex items-center justify-center">
                          <span className="text-orange-600 dark:text-orange-300 font-medium">
                            {instructor.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-stone-900 dark:text-white">
                            {instructor.username}
                            {instructor.isSuperAdmin && (
                              <span className="ml-2 px-2 py-0.5 text-xs bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 rounded-full">
                                Super Admin
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-stone-500 dark:text-stone-400">
                            {instructor.connectionStatus && (
                              <span className="inline-flex items-center">
                                <span
                                  className={`w-2 h-2 rounded-full mr-1.5 ${getStatusColor(
                                    instructor.connectionStatus
                                  )}`}
                                ></span>
                                {instructor.connectionStatus.charAt(0).toUpperCase() + instructor.connectionStatus.slice(1)}
                              </span>
                            )}
                          </div>
                        </div>
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {
                        instructor.profile_details? (
                          <TiTick className="text-green-600" />
                        ):(
                          <IoClose className="text-red-600" />
                        )
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-stone-900 dark:text-white">
                        {instructor.email || "-"}
                      </div>
                      <div className="text-sm text-stone-500 dark:text-stone-400">
                        {instructor.phone || "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingId === instructor._id ? (
                        <select
                          className="block w-full pl-3 pr-10 py-2 text-base border-stone-300 dark:border-stone-600 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm rounded-md bg-white dark:bg-stone-800"
                          value={editForm.role || instructor.role}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              role: e.target.value as Instructor["role"],
                            })
                          }
                          disabled={instructor.isSuperAdmin}
                        >
                          {roleOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 capitalize">
                          {instructor.role.replace("_", " ")}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingId === instructor._id ? (
                        <select
                          className="block w-full pl-3 pr-10 py-2 text-base border-stone-300 dark:border-stone-600 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm rounded-md bg-white dark:bg-stone-800"
                          value={editForm.status || instructor.status}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              status: e.target.value as Instructor["status"],
                            })
                          }
                          disabled={instructor.isSuperAdmin}
                        >
                          {statusOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${instructor.status === "working"
                              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                              : instructor.status === "suspended"
                                ? "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300"
                                : "bg-stone-100 text-stone-800 dark:bg-stone-700 dark:text-stone-300"
                            }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full mr-1.5 ${getStatusColor(
                              instructor.status
                            )}`}
                          ></span>
                          {instructor.status.charAt(0).toUpperCase() + instructor.status.slice(1)}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {editingId === instructor._id ? (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleUpdate(instructor._id)}
                            className="p-2 text-white bg-orange-600 rounded-lg hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors"
                            title="Save changes"
                          >
                            <TfiSave className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="p-2 text-stone-700 bg-stone-100 rounded-lg hover:bg-stone-200 dark:bg-stone-700 dark:text-stone-200 dark:hover:bg-stone-600 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2 transition-colors"
                            title="Cancel"
                          >
                            <TiCancel className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEditClick(instructor)}
                            disabled={
                              instructor.isSuperAdmin &&
                              currentUserRole !== "super_instructor"
                            }
                            className={`p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors ${instructor.isSuperAdmin &&
                                currentUserRole !== "super_instructor"
                                ? "text-stone-400 bg-stone-100 cursor-not-allowed dark:bg-stone-700"
                                : "text-orange-600 bg-orange-50 hover:bg-orange-100 dark:bg-orange-900/30 dark:hover:bg-orange-900/50"
                              }`}
                            title="Edit"
                          >
                            <FaRegEdit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(instructor)}
                            disabled={
                              instructor.isSuperAdmin &&
                              currentUserRole !== "super_instructor"
                            }
                            className={`p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors ${instructor.isSuperAdmin &&
                                currentUserRole !== "super_instructor"
                                ? "text-stone-400 bg-stone-100 cursor-not-allowed dark:bg-stone-700"
                                : "text-rose-600 bg-rose-50 hover:bg-rose-100 dark:bg-rose-900/30 dark:hover:bg-rose-900/50"
                              }`}
                            title="Delete"
                          >
                            <PiTrash className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {paginatedInstructors.length === 0 && (
            <div className="p-12 text-center">
              <div className="mx-auto h-24 w-24 text-stone-400">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-medium text-stone-900 dark:text-white">
                No instructors found
              </h3>
              <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
                {searchTerm ? "Try a different search term" : "No instructors available"}
              </p>
            </div>
          )}

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-stone-200 dark:border-stone-700 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-stone-700 dark:text-stone-300">
              Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{" "}
              <span className="font-medium">
                {Math.min(currentPage * itemsPerPage, filteredInstructors.length)}
              </span>{" "}
              of <span className="font-medium">{filteredInstructors.length}</span> results
            </div>
            <nav className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-md border border-stone-300 text-stone-500 hover:bg-stone-50 dark:border-stone-600 dark:text-stone-300 dark:hover:bg-stone-700 disabled:opacity-50 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500"
                aria-label="Previous page"
              >
                <FiChevronLeft className="h-5 w-5" />
              </button>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 ${currentPage === pageNum
                        ? "bg-orange-600 text-white"
                        : "text-stone-700 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-700"
                      }`}
                    aria-label={`Page ${pageNum}`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                onClick={() => setCurrentPage((p) => p + 1)}
                disabled={currentPage * itemsPerPage >= filteredInstructors.length}
                className="p-2 rounded-md border border-stone-300 text-stone-500 hover:bg-stone-50 dark:border-stone-600 dark:text-stone-300 dark:hover:bg-stone-700 disabled:opacity-50 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500"
                aria-label="Next page"
              >
                <FiChevronRight className="h-5 w-5" />
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}