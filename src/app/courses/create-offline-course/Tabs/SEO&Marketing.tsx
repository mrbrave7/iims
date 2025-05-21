import React, { useCallback, useMemo } from "react";
import {
  PiImage,
  PiPlus,
  PiTag,
  PiTextAa,
  PiTrash,
  PiVideo,
  PiWarning,
} from "react-icons/pi";
import { BiCategory } from "react-icons/bi";
import { MdCategory } from "react-icons/md";
import { GrScorecard } from "react-icons/gr";

// Define interfaces
interface I_Offline_Course_SEO_And_Marketing {
  courseBannerUrl: string;
  promoVideoUrl: string;
  seoMetaDescription: string;
  seoMetaTitle: string;
  tags: string[];
}

interface SEO_And_Marketing_Error {
  courseBannerUrl: string;
  promoVideoUrl: string;
  seoMetaDescription: string;
  seoMetaTitle: string;
  tags: string;
}

interface I_Offline_Course_Category {
  courseCategory: string;
  courseSubCategory: string;
  trendingScore: number;
}

interface I_Offline_Course_Category_Error {
  courseCategory: string;
  courseSubCategory: string;
  trendingScore: string;
}

interface SEOAndMarketingTabProps {
  seoAndMarketingData: I_Offline_Course_SEO_And_Marketing & I_Offline_Course_Category;
  seoAndMarketingError: SEO_And_Marketing_Error;
  categoryError: I_Offline_Course_Category_Error;
  singleTagField: string;
  onSEOAndMarketingChange: (
    name: keyof I_Offline_Course_SEO_And_Marketing,
    value: string
  ) => void;
  onCourseCategoryChange: (
    name: keyof I_Offline_Course_Category,
    value: string | number
  ) => void;
  onSingleTagChange: (value: string) => void;
  onAddTag: (tag: string) => void;
  onRemoveTag: (index: number) => void;
}

export function SEOAndMarketingTab({
  seoAndMarketingData,
  seoAndMarketingError,
  categoryError,
  singleTagField,
  onSEOAndMarketingChange,
  onCourseCategoryChange,
  onSingleTagChange,
  onAddTag,
  onRemoveTag,
}: SEOAndMarketingTabProps) {
  // Handle SEO and marketing field changes
  const handleSEOAndMarketing = useCallback(
    (name: keyof I_Offline_Course_SEO_And_Marketing, value: string) => {
      onSEOAndMarketingChange(name, value);
    },
    [onSEOAndMarketingChange]
  );

  // Handle course category field changes
  const handleCourseCategory = useCallback(
    (name: keyof I_Offline_Course_Category, value: string) => {
      const parsedValue =
        name === "trendingScore" ? parseFloat(value) || 0 : value;
      onCourseCategoryChange(name, parsedValue);
    },
    [onCourseCategoryChange]
  );

  // Handle adding tags
  const handleAddTags = useCallback(() => {
    const trimmedTag = singleTagField.trim();
    if (trimmedTag) {
      onAddTag(trimmedTag);
    }
  }, [singleTagField, onAddTag]);

  const SEOAndMarketing = useMemo(
    () => (
      <div className="space-y-6 min-w-[64rem]">
        <h1 className="text-4xl font-bold text-orange-600 text-shadow-xl">
          SEO, Marketing, and Categories
        </h1>
        <div className="grid grid-cols-2 gap-6">
          {/* SEO Meta Title */}
          <div className="space-y-1">
            <label htmlFor="seoMetaTitle" className="text-orange-600 font-bold">
              SEO Meta Title
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <PiTextAa className="h-5 w-5 text-stone-400" />
              </div>
              <input
                id="seoMetaTitle"
                name="seoMetaTitle"
                type="text"
                value={seoAndMarketingData.seoMetaTitle}
                onChange={(e) => handleSEOAndMarketing("seoMetaTitle", e.target.value)}
                className={`pl-10 outline-none w-full rounded-lg border ${seoAndMarketingError.seoMetaTitle
                  ? "border-red-500"
                  : seoAndMarketingData.seoMetaTitle
                    ? "border-orange-500"
                    : "border-stone-300 dark:border-stone-700"
                  } bg-stone-100 dark:bg-stone-800 py-2 px-3 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                placeholder="e.g., Learn Web Development in 30 Days"
                maxLength={60}
                aria-invalid={!!seoAndMarketingError.seoMetaTitle}
                aria-describedby="seoMetaTitle-error"
                aria-required="true"
              />
            </div>
            <div aria-live="polite">
              {seoAndMarketingError.seoMetaTitle && (
                <p
                  id="seoMetaTitle-error"
                  className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
                >
                  <PiWarning size={16} /> {seoAndMarketingError.seoMetaTitle}
                </p>
              )}
            </div>
            <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
              {seoAndMarketingData.seoMetaTitle.length}/60 characters
            </p>
          </div>
          {/* Course Category */}
          <div className="space-y-1 w-full">
            <label className="text-orange-600 font-bold" htmlFor="courseCategory">
              Course Category
            </label>
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <BiCategory className="h-5 w-5 text-stone-400" />
              </div>
              <input
                name="courseCategory"
                id="courseCategory"
                type="text"
                value={seoAndMarketingData.courseCategory}
                onChange={(e) => handleCourseCategory("courseCategory", e.target.value)}
                className={`pl-10 outline-none w-full rounded-lg border ${categoryError.courseCategory
                  ? "border-red-500"
                  : seoAndMarketingData.courseCategory
                    ? "border-orange-500"
                    : "border-stone-300 dark:border-stone-700"
                  } bg-stone-100 dark:bg-stone-800 py-2 px-3 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                placeholder="e.g., Web Development, Data Science"
                maxLength={100}
                aria-invalid={!!categoryError.courseCategory}
                aria-describedby="course-category-error"
                aria-required="true"
              />
            </div>
            <div aria-live="polite">
              {categoryError.courseCategory && (
                <p
                  id="course-category-error"
                  className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
                >
                  <PiWarning size={16} /> {categoryError.courseCategory}
                </p>
              )}
            </div>
          </div>

          {/* Course Sub-Category */}
          <div className="space-y-1 w-full">
            <label className="text-orange-600 font-bold" htmlFor="courseSubCategory">
              Course Sub-Category
            </label>
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MdCategory className="h-5 w-5 text-stone-400" />
              </div>
              <input
                name="courseSubCategory"
                id="courseSubCategory"
                type="text"
                value={seoAndMarketingData.courseSubCategory}
                onChange={(e) => handleCourseCategory("courseSubCategory", e.target.value)}
                className={`pl-10 outline-none w-full rounded-lg border ${categoryError.courseSubCategory
                  ? "border-red-500"
                  : seoAndMarketingData.courseSubCategory
                    ? "border-orange-500"
                    : "border-stone-300 dark:border-stone-700"
                  } bg-stone-100 dark:bg-stone-800 py-2 px-3 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                placeholder="e.g., Full Stack Development, Machine Learning"
                maxLength={100}
                aria-invalid={!!categoryError.courseSubCategory}
                aria-describedby="course-sub-category-error"
                aria-required="true"
              />
            </div>
            <div aria-live="polite">
              {categoryError.courseSubCategory && (
                <p
                  id="course-sub-category-error"
                  className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
                >
                  <PiWarning size={16} /> {categoryError.courseSubCategory}
                </p>
              )}
            </div>
          </div>

          {/* Trending Score */}
          <div className="space-y-1 w-full">
            <label className="text-orange-600 font-bold" htmlFor="trendingScore">
              Course Trending Score
            </label>
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <GrScorecard className="h-5 w-5 text-stone-400" />
              </div>
              <input
                name="trendingScore"
                id="trendingScore"
                type="number"
                min="0"
                step="0.1"
                value={seoAndMarketingData.trendingScore}
                onChange={(e) => handleCourseCategory("trendingScore", e.target.value)}
                className={`pl-10 outline-none w-full rounded-lg border ${categoryError.trendingScore
                  ? "border-red-500"
                  : seoAndMarketingData.trendingScore
                    ? "border-orange-500"
                    : "border-stone-300 dark:border-stone-700"
                  } bg-stone-100 dark:bg-stone-800 py-2 px-3 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                placeholder="e.g., 5.5"
                aria-invalid={!!categoryError.trendingScore}
                aria-describedby="course-trendingScore-error"
                aria-required="true"
              />
            </div>
            <div aria-live="polite">
              {categoryError.trendingScore && (
                <p
                  id="course-trendingScore-error"
                  className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
                >
                  <PiWarning size={16} /> {categoryError.trendingScore}
                </p>
              )}
            </div>
          </div>

          {/* Course Banner URL */}
          <div className="space-y-1">
            <label htmlFor="courseBannerUrl" className="text-orange-600 font-bold">
              Course Banner URL
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <PiImage className="h-5 w-5 text-stone-400" />
              </div>
              <input
                id="courseBannerUrl"
                name="courseBannerUrl"
                type="text"
                value={seoAndMarketingData.courseBannerUrl}
                onChange={(e) => handleSEOAndMarketing("courseBannerUrl", e.target.value)}
                className={`pl-10 outline-none w-full rounded-lg border ${seoAndMarketingError.courseBannerUrl
                  ? "border-red-500"
                  : seoAndMarketingData.courseBannerUrl
                    ? "border-orange-500"
                    : "border-stone-300 dark:border-stone-700"
                  } bg-stone-100 dark:bg-stone-800 py-2 px-3 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                placeholder="e.g., https://example.com/banner.jpg"
                maxLength={200}
                aria-invalid={!!seoAndMarketingError.courseBannerUrl}
                aria-describedby="courseBannerUrl-error"
                aria-required="true"
              />
            </div>
            <div aria-live="polite">
              {seoAndMarketingError.courseBannerUrl && (
                <p
                  id="courseBannerUrl-error"
                  className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
                >
                  <PiWarning size={16} /> {seoAndMarketingError.courseBannerUrl}
                </p>
              )}
            </div>
          </div>

          {/* Promo Video URL */}
          <div className="space-y-1">
            <label htmlFor="promoVideoUrl" className="text-orange-600 font-bold">
              Promo Video URL
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <PiVideo className="h-5 w-5 text-stone-400" />
              </div>
              <input
                id="promoVideoUrl"
                name="promoVideoUrl"
                type="text"
                value={seoAndMarketingData.promoVideoUrl}
                onChange={(e) => handleSEOAndMarketing("promoVideoUrl", e.target.value)}
                className={`pl-10 outline-none w-full rounded-lg border ${seoAndMarketingError.promoVideoUrl
                  ? "border-red-500"
                  : seoAndMarketingData.promoVideoUrl
                    ? "border-orange-500"
                    : "border-stone-300 dark:border-stone-700"
                  } bg-stone-100 dark:bg-stone-800 py-2 px-3 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                placeholder="e.g., https://youtube.com/watch?v=promo"
                maxLength={200}
                aria-invalid={!!seoAndMarketingError.promoVideoUrl}
                aria-describedby="promoVideoUrl-error"
                aria-required="true"
              />
            </div>
            <div aria-live="polite">
              {seoAndMarketingError.promoVideoUrl && (
                <p
                  id="promoVideoUrl-error"
                  className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
                >
                  <PiWarning size={16} /> {seoAndMarketingError.promoVideoUrl}
                </p>
              )}
            </div>
          </div>
        </div>
        {/* Tags */}
        <div className="space-y-1">
          <label htmlFor="tags" className="text-orange-600 font-bold">
            Tags
          </label>
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <PiTag className="h-5 w-5 text-stone-400" />
              </div>
              <input
                id="tags"
                name="tags"
                type="text"
                value={singleTagField}
                onChange={(e) => onSingleTagChange(e.target.value)}
                className={`pl-10 outline-none w-full rounded-lg border ${seoAndMarketingError.tags
                  ? "border-red-500"
                  : singleTagField
                    ? "border-orange-500"
                    : "border-stone-300 dark:border-stone-700"
                  } bg-stone-100 dark:bg-stone-800 py-2 px-3 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                placeholder="e.g., web development, coding"
                maxLength={50}
                aria-invalid={!!seoAndMarketingError.tags}
                aria-describedby="seo-tags-error"
              />
            </div>
            <button
              type="button"
              onClick={handleAddTags}
              className="flex items-center gap-2 px-4 py-2 text-stone-100 dark:text-stone-900 bg-orange-600 rounded font-bold hover:bg-orange-700"
            >
              <PiPlus /> Add
            </button>
          </div>
          <div aria-live="polite">
            {seoAndMarketingError.tags && (
              <p
                id="seo-tags-error"
                className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
              >
                <PiWarning size={16} /> {seoAndMarketingError.tags}
              </p>
            )}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {seoAndMarketingData.tags.map((tag, index) => (
              <span
                key={index}
                className="flex items-center gap-2 border border-orange-600 px-3 py-1 text-orange-600 rounded-full bg-stone-100/50 dark:bg-stone-800"
              >
                <p>{tag}</p>
                <button
                  type="button"
                  onClick={() => onRemoveTag(index)}
                  className="text-red-600 hover:text-red-800"
                  aria-label={`Remove tag: ${tag}`}
                >
                  <PiTrash />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* SEO Meta Description */}
        <div className="space-y-1">
          <label htmlFor="seoMetaDescription" className="text-orange-600 font-bold">
            SEO Meta Description
          </label>
          <textarea
            id="seoMetaDescription"
            name="seoMetaDescription"
            value={seoAndMarketingData.seoMetaDescription}
            onChange={(e) => handleSEOAndMarketing("seoMetaDescription", e.target.value)}
            className={`w-full rounded-lg border ${seoAndMarketingError.seoMetaDescription
              ? "border-red-500"
              : seoAndMarketingData.seoMetaDescription
                ? "border-orange-500"
                : "border-stone-300 dark:border-stone-700"
              } bg-stone-100 dark:bg-stone-800 py-2 px-3 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent min-h-[100px]`}
            placeholder="e.g., Master web development with our comprehensive course covering HTML, CSS, and JavaScript."
            maxLength={160}
            aria-invalid={!!seoAndMarketingError.seoMetaDescription}
            aria-describedby="seoMetaDescription-error"
            aria-required="true"
          />
          <div aria-live="polite">
            {seoAndMarketingError.seoMetaDescription && (
              <p
                id="seoMetaDescription-error"
                className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
              >
                <PiWarning size={16} /> {seoAndMarketingError.seoMetaDescription}
              </p>
            )}
          </div>
          <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
            {seoAndMarketingData.seoMetaDescription.length}/160 characters
          </p>
        </div>
      </div>
    ),
    [
      seoAndMarketingData,
      seoAndMarketingError,
      categoryError,
      singleTagField,
      handleSEOAndMarketing,
      handleCourseCategory,
      onSingleTagChange,
      handleAddTags,
      onRemoveTag,
    ]
  );

  return SEOAndMarketing;
}