import React, { useCallback, useMemo } from 'react';
import { PiBook, PiImage, PiLink, PiListBullets, PiPlus, PiTrash, PiWarning } from 'react-icons/pi';
import sanitizeHtml from 'sanitize-html';

// Interfaces
interface BasicInfoErrors {
  courseName: string;
  courseGoals: string;
  courseLevel: string;
  courseDescription: string;
  syllabusOutline: string;
  courseDurationInHours: string;
  courseCategory: string;
  courseSubCategory: string;
  preRequisites: string;
  courseBannerUrl: string;
}

interface BasicInfoDetails {
  courseName: string;
  courseGoals: string[];
  courseLevel: 'Beginner' | 'Intermediate' | 'Advanced' | 'Academic';
  syllabusOutline: string[];
  courseDescription: string;
  courseDurationInHours: number;
  courseCategory: string;
  courseSubCategory: string;
  preRequisites: string[];
  courseBannerUrl: string;
  trendingScore: number;
}

interface DetailsTabProps {
  details: BasicInfoDetails;
  detailsErrors: BasicInfoErrors;
  singleSyllabusOutline: string;
  singleCourseGoals: string;
  singlePreRequisites: string;
  onSinglePreRequisitesChange: (value: string) => void;
  onDetailsChange: (name: keyof BasicInfoDetails, value: any) => void;
  onSyllabusOutlineChange: (value: string) => void;
  onCourseGoalsChange: (value: string) => void;
  onAddSyllabusOutline: (value: string) => void;
  onRemoveSyllabusOutline: (index: number) => void;
  onAddCourseGoals: (value: string) => void;
  onRemoveCourseGoals: (index: number) => void;
  onAddPreRequisites: (value: string) => void;
  onRemovePreRequisites: (index: number) => void;
}

const BasicInfoTab: React.FC<DetailsTabProps> = ({
  details,
  detailsErrors,
  singleSyllabusOutline,
  singleCourseGoals,
  singlePreRequisites,
  onDetailsChange,
  onSyllabusOutlineChange,
  onCourseGoalsChange,
  onSinglePreRequisitesChange,
  onAddSyllabusOutline,
  onRemoveSyllabusOutline,
  onAddCourseGoals,
  onRemoveCourseGoals,
  onAddPreRequisites,
  onRemovePreRequisites,
}) => {
  const courseLevelOptions: BasicInfoDetails['courseLevel'][] = [
    'Beginner',
    'Intermediate',
    'Advanced',
    "Academic"
  ];

  // Handle input changes
  const handleDetails = useCallback(
    (name: keyof BasicInfoDetails, value: string) => {
      const sanitizedValue = sanitizeHtml(value, { allowedTags: [] });
      const parsedValue =
        name === 'courseDurationInHours'
          ? Math.max(0, parseInt(sanitizedValue) || 0)
          : sanitizedValue;
      onDetailsChange(name, parsedValue);
    },
    [onDetailsChange]
  );

  // Handle add syllabus outline
  const handleAddSyllabusOutline = useCallback(() => {
    const trimmed = singleSyllabusOutline.trim();
    if (trimmed) {
      onAddSyllabusOutline(trimmed);
      onSyllabusOutlineChange('');
    }
  }, [singleSyllabusOutline, onAddSyllabusOutline, onSyllabusOutlineChange]);

  // Handle add course goal
  const handleAddCourseGoals = useCallback(() => {
    const trimmed = singleCourseGoals.trim();
    if (trimmed) {
      onAddCourseGoals(trimmed);
      onCourseGoalsChange('');
    }
  }, [singleCourseGoals, onAddCourseGoals, onCourseGoalsChange]);

  // Handle add prerequisites
  const handleAddPreRequisites = useCallback(() => {
    const trimmed = singlePreRequisites.trim();
    if (trimmed) {
      onAddPreRequisites(trimmed);
      onSinglePreRequisitesChange('');
    }
  }, [singlePreRequisites, onAddPreRequisites, onSinglePreRequisitesChange]);


  // Memoized component
  const DetailsContent = useMemo(
    () => (
      <div className="space-y-6 w-full max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-orange-600">Course Basic Details</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Course Name */}
          <div className="space-y-1">
            <label htmlFor="courseName" className="text-orange-600 font-bold">
              Course Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <PiBook className="h-5 w-5 text-stone-400" />
              </div>
              <input
                id="courseName"
                name="courseName"
                type="text"
                required
                value={details.courseName}
                onChange={(e) => handleDetails('courseName', e.target.value)}
                className={`pl-10 outline-none w-full rounded-lg border ${detailsErrors.courseName
                  ? 'border-red-500'
                  : details.courseName
                    ? 'border-orange-500'
                    : 'border-stone-300 dark:border-stone-700'
                  } bg-stone-100 dark:bg-stone-800 py-2 px-3 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                placeholder="e.g., 30 Days JavaScript"
                maxLength={100}
                aria-invalid={!!detailsErrors.courseName}
                aria-describedby="courseName-error courseName-counter"
                aria-required="true"
              />
            </div>
            <div aria-live="polite">
              {detailsErrors.courseName && (
                <p
                  id="courseName-error"
                  className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
                >
                  <PiWarning size={16} /> {detailsErrors.courseName}
                </p>
              )}
              <p
                id="courseName-counter"
                className="mt-1 text-xs text-stone-500 dark:text-stone-400"
              >
                {details.courseName.length}/100 characters
              </p>
            </div>
          </div>

          {/* Course Level */}
          <div className="space-y-1">
            <label htmlFor="courseLevel" className="text-orange-600 font-bold">
              Course Level
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <PiBook className="h-5 w-5 text-stone-400" />
              </div>
              <select
                id="courseLevel"
                name="courseLevel"
                required
                value={details.courseLevel}
                onChange={(e) => handleDetails('courseLevel', e.target.value)}
                className={`pl-10 outline-none w-full rounded-lg border ${detailsErrors.courseLevel
                  ? 'border-red-500'
                  : details.courseLevel
                    ? 'border-orange-500'
                    : 'border-stone-300 dark:border-stone-700'
                  } bg-stone-100 dark:bg-stone-800 py-2 px-3 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                aria-invalid={!!detailsErrors.courseLevel}
                aria-describedby="courseLevel-error"
                aria-required="true"
              >
                <option value="" disabled>
                  Select Course Level
                </option>
                {courseLevelOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div aria-live="polite">
              {detailsErrors.courseLevel && (
                <p
                  id="courseLevel-error"
                  className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
                >
                  <PiWarning size={16} /> {detailsErrors.courseLevel}
                </p>
              )}
            </div>
          </div>

          {/* Course Duration */}
          <div className="space-y-1">
            <label htmlFor="courseDurationInHours" className="text-orange-600 font-bold">
              Course Duration (Hours)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <PiBook className="h-5 w-5 text-stone-400" />
              </div>
              <input
                id="courseDurationInHours"
                name="courseDurationInHours"
                type="number"
                required
                min="0"
                value={details.courseDurationInHours}
                onChange={(e) => handleDetails('courseDurationInHours', e.target.value)}
                className={`pl-10 outline-none w-full rounded-lg border ${detailsErrors.courseDurationInHours
                  ? 'border-red-500'
                  : details.courseDurationInHours
                    ? 'border-orange-500'
                    : 'border-stone-300 dark:border-stone-700'
                  } bg-stone-100 dark:bg-stone-800 py-2 px-3 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                placeholder="e.g., 40"
                aria-invalid={!!detailsErrors.courseDurationInHours}
                aria-describedby="courseDurationInHours-error"
                aria-required="true"
              />
            </div>
            <div aria-live="polite">
              {detailsErrors.courseDurationInHours && (
                <p
                  id="courseDurationInHours-error"
                  className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
                >
                  <PiWarning size={16} /> {detailsErrors.courseDurationInHours}
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
                type="url"
                required
                value={details.courseBannerUrl}
                onChange={(e) => handleDetails('courseBannerUrl', e.target.value)}
                className={`pl-10 outline-none w-full rounded-lg border ${detailsErrors.courseBannerUrl
                  ? 'border-red-500'
                  : details.courseBannerUrl
                    ? 'border-orange-500'
                    : 'border-stone-300 dark:border-stone-700'
                  } bg-stone-100 dark:bg-stone-800 py-2 px-3 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                placeholder="e.g., https://example.com/banner.jpg"
                maxLength={500}
                aria-invalid={!!detailsErrors.courseBannerUrl}
                aria-describedby="courseBannerUrl-error courseBannerUrl-counter"
                aria-required="true"
              />
            </div>
            <div aria-live="polite">
              {detailsErrors.courseBannerUrl && (
                <p
                  id="courseBannerUrl-error"
                  className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
                >
                  <PiWarning size={16} /> {detailsErrors.courseBannerUrl}
                </p>
              )}
              <p
                id="courseBannerUrl-counter"
                className="mt-1 text-xs text-stone-500 dark:text-stone-400"
              >
                {details.courseBannerUrl.length}/500 characters
              </p>
            </div>
          </div>
        </div>

        {/* Course Categories */}
        <div className="space-y-1">
          <label htmlFor="courseCategories" className="text-orange-600 font-bold">
            Course Categories
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <PiBook className="h-5 w-5 text-stone-400" />
            </div>
            <div className="flex items-center gap-2">
              <input
                id="courseCategories"
                name="courseCategories"
                type="text"
                value={details.courseCategory}
                onChange={(e) => handleDetails("courseCategory", e.target.value)}
                className={`pl-10 outline-none w-full rounded-lg border ${detailsErrors.courseCategory
                  ? 'border-red-500'
                  : details.courseCategory
                    ? 'border-orange-500'
                    : 'border-stone-300 dark:border-stone-700'
                  } bg-stone-100 dark:bg-stone-800 py-2 px-3 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                placeholder="e.g., Programming"
                maxLength={50}
                aria-invalid={!!detailsErrors.courseCategory}
                aria-describedby="courseCategories-error courseCategories-counter"
              />
            </div>
          </div>
          <div aria-live="polite">
            {detailsErrors.courseCategory && (
              <p
                id="courseCategories-error"
                className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
              >
                <PiWarning size={16} /> {detailsErrors.courseCategory}
              </p>
            )}
            <p
              id="courseCategories-counter"
              className="mt-1 text-xs text-stone-500 dark:text-stone-400"
            >
              {details.courseCategory.length}/50 characters
            </p>
          </div>
        </div>

        {/* Course Sub-Categories */}
        <div className="space-y-1">
          <label htmlFor="courseSubCategories" className="text-orange-600 font-bold">
            Course Sub-Categories
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <PiBook className="h-5 w-5 text-stone-400" />
            </div>
            <div className="flex items-center gap-2">
              <input
                id="courseSubCategories"
                name="courseSubCategories"
                type="text"
                value={details.courseSubCategory}
                onChange={(e) => handleDetails("courseSubCategory", e.target.value)}
                className={`pl-10 outline-none w-full rounded-lg border ${detailsErrors.courseSubCategory
                  ? 'border-red-500'
                  : details.courseSubCategory
                    ? 'border-orange-500'
                    : 'border-stone-300 dark:border-stone-700'
                  } bg-stone-100 dark:bg-stone-800 py-2 px-3 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                placeholder="e.g., JavaScript"
                maxLength={50}
                aria-invalid={!!detailsErrors.courseSubCategory}
                aria-describedby="courseSubCategories-error courseSubCategories-counter"
              />
            </div>
          </div>
          <div aria-live="polite">
            {detailsErrors.courseSubCategory && (
              <p
                id="courseSubCategories-error"
                className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
              >
                <PiWarning size={16} /> {detailsErrors.courseSubCategory}
              </p>
            )}
            <p
              id="courseSubCategories-counter"
              className="mt-1 text-xs text-stone-500 dark:text-stone-400"
            >
              {details.courseSubCategory.length}/50 characters
            </p>
          </div>
        </div>

        {/* Syllabus Outline */}
        <div className="space-y-1">
          <label htmlFor="syllabusOutline" className="text-orange-600 font-bold">
            Syllabus Outline
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <PiListBullets className="h-5 w-5 text-stone-400" />
            </div>
            <div className="flex items-center gap-2">
              <input
                id="syllabusOutline"
                name="syllabusOutline"
                type="text"
                value={singleSyllabusOutline}
                onChange={(e) => onSyllabusOutlineChange(e.target.value)}
                className={`pl-10 outline-none w-full rounded-lg border ${detailsErrors.syllabusOutline
                  ? 'border-red-500'
                  : singleSyllabusOutline
                    ? 'border-orange-500'
                    : 'border-stone-300 dark:border-stone-700'
                  } bg-stone-100 dark:bg-stone-800 py-2 px-3 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                placeholder="e.g., Introduction to Statistics"
                maxLength={100}
                aria-invalid={!!detailsErrors.syllabusOutline}
                aria-describedby="syllabusOutline-error syllabusOutline-counter"
              />
              <button
                type="button"
                onClick={handleAddSyllabusOutline}
                className="p-2 h-10 w-10 rounded flex items-center justify-center bg-orange-600 text-stone-100 hover:bg-orange-700 transition-colors"
                disabled={!singleSyllabusOutline.trim()}
                aria-label="Add syllabus outline item"
              >
                <PiPlus />
              </button>
            </div>
          </div>
          <div aria-live="polite">
            {detailsErrors.syllabusOutline && (
              <p
                id="syllabusOutline-error"
                className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
              >
                <PiWarning size={16} /> {detailsErrors.syllabusOutline}
              </p>
            )}
            <p
              id="syllabusOutline-counter"
              className="mt-1 text-xs text-stone-500 dark:text-stone-400"
            >
              {singleSyllabusOutline.length}/100 characters
            </p>
          </div>
          <div className="mt-4 space-y-2">
            <span className="text-orange-600 font-bold">Added Syllabus Items:</span>
            {details.syllabusOutline.length > 0 ? (
              <ul className="flex flex-wrap gap-4">
                {details.syllabusOutline.map((item, index) => (
                  <li
                    key={index}
                    className="flex gap-2 px-3 py-1 text-orange-600 rounded font-bold bg-stone-100/50 dark:bg-stone-800/50"
                  >
                    <span>{item}</span>
                    <button
                      type="button"
                      onClick={() => onRemoveSyllabusOutline(index)}
                      className="hover:text-red-600 transition-colors"
                      aria-label={`Remove syllabus item ${item}`}
                    >
                      <PiTrash />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-stone-500">No syllabus items added.</p>
            )}
          </div>
        </div>

        {/* Course Goals */}
        <div className="space-y-1">
          <label htmlFor="courseGoals" className="text-orange-600 font-bold">
            Course Goals
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <PiListBullets className="h-5 w-5 text-stone-400" />
            </div>
            <div className="flex items-center gap-2">
              <input
                id="courseGoals"
                name="courseGoals"
                type="text"
                value={singleCourseGoals}
                onChange={(e) => onCourseGoalsChange(e.target.value)}
                className={`pl-10 outline-none w-full rounded-lg border ${detailsErrors.courseGoals
                  ? 'border-red-500'
                  : singleCourseGoals
                    ? 'border-orange-500'
                    : 'border-stone-300 dark:border-stone-700'
                  } bg-stone-100 dark:bg-stone-800 py-2 px-3 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                placeholder="e.g., Master JavaScript fundamentals"
                maxLength={100}
                aria-invalid={!!detailsErrors.courseGoals}
                aria-describedby="courseGoals-error courseGoals-counter"
              />
              <button
                type="button"
                onClick={handleAddCourseGoals}
                className="p-2 h-10 w-10 rounded flex items-center justify-center bg-orange-600 text-stone-100 hover:bg-orange-700 transition-colors"
                disabled={!singleCourseGoals.trim()}
                aria-label="Add course goal"
              >
                <PiPlus />
              </button>
            </div>
          </div>
          <div aria-live="polite">
            {detailsErrors.courseGoals && (
              <p
                id="courseGoals-error"
                className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
              >
                <PiWarning size={16} /> {detailsErrors.courseGoals}
              </p>
            )}
            <p
              id="courseGoals-counter"
              className="mt-1 text-xs text-stone-500 dark:text-stone-400"
            >
              {singleCourseGoals.length}/100 characters
            </p>
          </div>
          <div className="mt-4 space-y-2">
            <span className="text-orange-600 font-bold">Added Goals:</span>
            {details.courseGoals.length > 0 ? (
              <ul className="flex flex-wrap gap-4">
                {details.courseGoals.map((goal, index) => (
                  <li
                    key={index}
                    className="flex gap-2 px-3 py-1 text-orange-600 rounded font-bold bg-stone-100/50 dark:bg-stone-800/50"
                  >
                    <span>{goal}</span>
                    <button
                      type="button"
                      onClick={() => onRemoveCourseGoals(index)}
                      className="hover:text-red-600 transition-colors"
                      aria-label={`Remove goal ${goal}`}
                    >
                      <PiTrash />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-stone-500">No goals added.</p>
            )}
          </div>
        </div>

        {/* Prerequisites */}
        <div className="space-y-1">
          <label htmlFor="preRequisites" className="text-orange-600 font-bold">
            Course Prerequisites
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <PiLink className="h-5 w-5 text-stone-400" />
            </div>
            <div className="flex items-center gap-2">
              <input
                id="preRequisites"
                name="preRequisites"
                type="text"
                value={singlePreRequisites}
                onChange={(e) => onSinglePreRequisitesChange(e.target.value)}
                className={`pl-10 outline-none w-full rounded-lg border ${detailsErrors.preRequisites
                  ? 'border-red-500'
                  : singlePreRequisites
                    ? 'border-orange-500'
                    : 'border-stone-300 dark:border-stone-700'
                  } bg-stone-100 dark:bg-stone-800 py-2 px-3 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                placeholder="e.g., Basic programming knowledge"
                maxLength={100}
                aria-invalid={!!detailsErrors.preRequisites}
                aria-describedby="preRequisites-error preRequisites-counter"
              />
              <button
                type="button"
                onClick={handleAddPreRequisites}
                className="p-2 h-10 w-10 rounded flex items-center justify-center bg-orange-600 text-stone-100 hover:bg-orange-700 transition-colors"
                disabled={!singlePreRequisites.trim()}
                aria-label="Add prerequisite"
              >
                <PiPlus />
              </button>
            </div>
          </div>
          <div aria-live="polite">
            {detailsErrors.preRequisites && (
              <p
                id="preRequisites-error"
                className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
              >
                <PiWarning size={16} /> {detailsErrors.preRequisites}
              </p>
            )}
            <p
              id="preRequisites-counter"
              className="mt-1 text-xs text-stone-500 dark:text-stone-400"
            >
              {singlePreRequisites.length}/100 characters
            </p>
          </div>
          <div className="mt-4 space-y-2">
            <span className="text-orange-600 font-bold">Added Prerequisites:</span>
            {details.preRequisites.length > 0 ? (
              <ul className="flex flex-wrap gap-4">
                {details.preRequisites.map((prerequisite, index) => (
                  <li
                    key={index}
                    className="flex gap-2 px-3 py-1 text-orange-600 rounded font-bold bg-stone-100/50 dark:bg-stone-800/50"
                  >
                    <span>{prerequisite}</span>
                    <button
                      type="button"
                      onClick={() => onRemovePreRequisites(index)}
                      className="hover:text-red-600 transition-colors"
                      aria-label={`Remove prerequisite ${prerequisite}`}
                    >
                      <PiTrash />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-stone-500">No prerequisites added.</p>
            )}
          </div>
        </div>

        {/* Course Description */}
        <div className="space-y-1">
          <label htmlFor="courseDescription" className="text-orange-600 font-bold">
            Course Description
          </label>
          <textarea
            id="courseDescription"
            name="courseDescription"
            required
            value={details.courseDescription}
            onChange={(e) => handleDetails('courseDescription', e.target.value)}
            className={`w-full rounded-lg border ${detailsErrors.courseDescription
              ? 'border-red-500'
              : details.courseDescription
                ? 'border-orange-500'
                : 'border-stone-300 dark:border-stone-700'
              } bg-stone-100 dark:bg-stone-800 py-2 px-3 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent min-h-[100px]`}
            placeholder="e.g., Learn JavaScript fundamentals, including variables, functions, and DOM manipulation."
            maxLength={3000}
            aria-invalid={!!detailsErrors.courseDescription}
            aria-describedby="courseDescription-error courseDescription-counter"
            aria-required="true"
          />
          <div aria-live="polite">
            {detailsErrors.courseDescription && (
              <p
                id="courseDescription-error"
                className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
              >
                <PiWarning size={16} /> {detailsErrors.courseDescription}
              </p>
            )}
            <p
              id="courseDescription-counter"
              className="mt-1 text-xs text-stone-500 dark:text-stone-400"
            >
              {details.courseDescription.length}/3000 characters
            </p>
          </div>
        </div>

        {/* Trending Score (Read-Only) */}
        <div className="space-y-1">
          <label htmlFor="trendingScore" className="text-orange-600 font-bold">
            Trending Score
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <PiBook className="h-5 w-5 text-stone-400" />
            </div>
            <input
              id="trendingScore"
              name="trendingScore"
              type="number"
              value={details.trendingScore}
              onChange={(e) => handleDetails("trendingScore",e.target.value)}
              readOnly
              className="pl-10 outline-none w-full rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-100 dark:bg-stone-800 py-2 px-3 text-stone-900 dark:text-stone-100 opacity-50"
              aria-readonly="true"
              aria-describedby="trendingScore-info"
            />
          </div>
          <p
            id="trendingScore-info"
            className="mt-1 text-xs text-stone-500 dark:text-stone-400"
          >
            Calculated based on enrollments and ratings
          </p>
        </div>
      </div>
    ),
    [
      details,
      detailsErrors,
      singleSyllabusOutline,
      singleCourseGoals,
      singlePreRequisites,
      onDetailsChange,
      onSyllabusOutlineChange,
      onCourseGoalsChange,
      onSinglePreRequisitesChange,
      handleAddSyllabusOutline,
      handleAddCourseGoals,
      handleAddPreRequisites, ,
      onRemoveSyllabusOutline,
      onRemoveCourseGoals,
      onRemovePreRequisites,
    ]
  );

  return DetailsContent;
};

export default BasicInfoTab;