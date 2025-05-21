"use client"
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { PiStarFill, PiUsers, PiClock, PiTag, PiSpinnerGap, PiCertificate, PiMapPin, PiCalendar } from "react-icons/pi";

interface Instructor {
  fullName: string;
  avatarUrl: string;
  expertise: string[];
}

interface Course {
  id: string;
  type: "online" | "offline" | "free";
  name: string;
  slug: string;
  banner: string;
  description: string;
  duration: string;
  instructor: Instructor;
  price?: number;
  enrollment: number;
  rating: number;
  category: string;
  level: string;
  syllabus: string[];
  faqs: { question: string; answer: string }[];
  languages: string[];
  audience: string[];
  certificateUrl?: string;
  refundPolicy?: { isRefundable: boolean; refundPeriodDays: number; conditions?: string };
  contact: { email: string; phone: string };
  logistics?: { batchId: string; startDate: string; endDate: string; maxSeats: number; isFull: boolean }[];
}

export default function CourseDetailPage(): React.ReactElement {
  const params = useParams();
  const type = params.type as string;
  const slug = params.slug as string;
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const router = useSearchParams()
  console.log(router)

  useEffect(() => {
    async function fetchCourse() {
      setLoading(true);
      try {
        const response = await fetch(`/api/courses/${type}/${slug}`);
        if (!response.ok) throw new Error("Failed to fetch course");
        const data = await response.json();
        setCourse(data.course);
      } catch (err: any) {
        setError(err.message || "Failed to load course");
      } finally {
        setLoading(false);
      }
    }
    fetchCourse();
  }, [type, slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 dark:bg-stone-900">
        <PiSpinnerGap className="w-12 h-12 text-orange-500 dark:text-orange-400 animate-spin" />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 dark:bg-stone-900">
        <div className="bg-stone-100 dark:bg-stone-800 border-l-4 border-orange-500 dark:border-orange-400 p-4">
          <div className="flex items-center gap-3">
            <PiCertificate className="text-orange-500 dark:text-orange-400" size={20} />
            <p className="text-stone-700 dark:text-stone-200">{error || "Course not found"}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Course Header */}
        <div className="bg-stone-100 dark:bg-stone-800 rounded-xl shadow-sm border border-stone-200 dark:border-stone-600 p-6 mb-8">
          <div className="relative h-64 mb-4">
            <Image
              src={course.banner}
              alt={course.name}
              fill
              className="rounded-lg object-cover"
              onError={(e) => {
                e.currentTarget.src = "/default-course-banner.jpg";
              }}
            />
          </div>
          <h1 className="text-3xl font-bold text-stone-800 dark:text-stone-100 mb-2">{course.name}</h1>
          <p className="text-stone-600 dark:text-stone-300 mb-4">{course.description}</p>
          <div className="flex flex-wrap gap-4 text-sm text-stone-600 dark:text-stone-300">
            <div className="flex items-center gap-2">
              <PiClock className="text-orange-500 dark:text-orange-400" />
              <span>{course.duration}</span>
            </div>
            <div className="flex items-center gap-2">
              <PiUsers className="text-orange-500 dark:text-orange-400" />
              <span>{course.enrollment} enrolled</span>
            </div>
            <div className="flex items-center gap-2">
              <PiStarFill className="text-orange-500 dark:text-orange-400" />
              <span>{course.rating} / 5</span>
            </div>
            {course.price !== undefined && (
              <div className="flex items-center gap-2">
                <PiTag className="text-orange-500 dark:text-orange-400" />
                <span>${course.price.toFixed(2)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Instructor Info */}
        <div className="bg-stone-100 dark:bg-stone-800 rounded-xl shadow-sm border border-stone-200 dark:border-stone-600 p-6 mb-8">
          <h2 className="text-xl font-semibold text-stone-800 dark:text-stone-100 mb-4">Instructor</h2>
          <div className="flex items-center gap-4">
            <Image
              src={course.instructor.avatarUrl}
              alt={course.instructor.fullName}
              width={60}
              height={60}
              className="rounded-full object-cover"
              onError={(e) => {
                e.currentTarget.src = "/default-avatar.jpg";
              }}
            />
            <div>
              <p className="text-lg font-medium text-stone-700 dark:text-stone-200">
                {course.instructor.fullName}
              </p>
              <p className="text-sm text-stone-500 dark:text-stone-400">
                {course.instructor.expertise.join(", ")}
              </p>
            </div>
          </div>
        </div>

        {/* Syllabus */}
        <div className="bg-stone-100 dark:bg-stone-800 rounded-xl shadow-sm border border-stone-200 dark:border-stone-600 p-6 mb-8">
          <h2 className="text-xl font-semibold text-stone-800 dark:text-stone-100 mb-4">Syllabus</h2>
          <ul className="space-y-2">
            {course.syllabus.map((item, index) => (
              <li
                key={index}
                className="flex items-center gap-2 text-stone-600 dark:text-stone-300"
              >
                <span className="w-2 h-2 bg-orange-500 dark:bg-orange-400 rounded-full"></span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Logistics (Offline Only) */}
        {course.type === "offline" && course.logistics && (
          <div className="bg-stone-100 dark:bg-stone-800 rounded-xl shadow-sm border border-stone-200 dark:border-stone-600 p-6 mb-8">
            <h2 className="text-xl font-semibold text-stone-800 dark:text-stone-100 mb-4">Logistics</h2>
            <div className="space-y-4">
              {course.logistics.map((batch) => (
                <div key={batch.batchId} className="border-l-4 border-orange-500 dark:border-orange-400 pl-4">
                  <p className="text-stone-700 dark:text-stone-200">
                    <PiCalendar className="inline mr-2 text-orange-500 dark:text-orange-400" />
                    Start: {new Date(batch.startDate).toLocaleDateString()}
                  </p>
                  <p className="text-stone-700 dark:text-stone-200">
                    <PiCalendar className="inline mr-2 text-orange-500 dark:text-orange-400" />
                    End: {new Date(batch.endDate).toLocaleDateString()}
                  </p>
                  <p className="text-stone-700 dark:text-stone-200">
                    <PiUsers className="inline mr-2 text-orange-500 dark:text-orange-400" />
                    Seats: {batch.isFull ? "Full" : `${batch.maxSeats} available`}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FAQs */}
        {course.faqs.length > 0 && (
          <div className="bg-stone-100 dark:bg-stone-800 rounded-xl shadow-sm border border-stone-200 dark:border-stone-600 p-6 mb-8">
            <h2 className="text-xl font-semibold text-stone-800 dark:text-stone-100 mb-4">FAQs</h2>
            <div className="space-y-4">
              {course.faqs.map((faq, index) => (
                <div key={index}>
                  <p className="font-medium text-stone-700 dark:text-stone-200">{faq.question}</p>
                  <p className="text-stone-600 dark:text-stone-300">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Additional Info */}
        <div className="bg-stone-100 dark:bg-stone-800 rounded-xl shadow-sm border border-stone-200 dark:border-stone-600 p-6 mb-8">
          <h2 className="text-xl font-semibold text-stone-800 dark:text-stone-100 mb-4">Additional Information</h2>
          <p className="text-stone-600 dark:text-stone-300 mb-2">
            <strong>Category:</strong> {course.category}
          </p>
          <p className="text-stone-600 dark:text-stone-300 mb-2">
            <strong>Level:</strong> {course.level}
          </p>
          <p className="text-stone-600 dark:text-stone-300 mb-2">
            <strong>Languages:</strong> {course.languages.join(", ")}
          </p>
          <p className="text-stone-600 dark:text-stone-300 mb-2">
            <strong>Target Audience:</strong> {course.audience.join(", ")}
          </p>
          {course.certificateUrl && (
            <p className="text-stone-600 dark:text-stone-300 mb-2">
              <strong>Certificate:</strong> Available
            </p>
          )}
          {course.refundPolicy && (
            <p className="text-stone-600 dark:text-stone-300 mb-2">
              <strong>Refund Policy:</strong>{" "}
              {course.refundPolicy.isRefundable
                ? `${course.refundPolicy.refundPeriodDays} days`
                : "Non-refundable"}
              {course.refundPolicy.conditions && ` (${course.refundPolicy.conditions})`}
            </p>
          )}
          <p className="text-stone-600 dark:text-stone-300 mb-2">
            <strong>Contact:</strong> {course.contact.email}, {course.contact.phone}
          </p>
        </div>

        {/* Enroll Button */}
        <div className="text-center">
          <button
            className="inline-flex items-center px-6 py-3 bg-orange-600 dark:bg-orange-500 text-white rounded-lg hover:bg-orange-700 dark:hover:bg-orange-400 transition-colors text-lg font-medium"
            disabled={course.type === "offline" && course.logistics?.every((b) => b.isFull)}
          >
            Enroll Now
          </button>
        </div>
      </div>
    </div>
  );
}