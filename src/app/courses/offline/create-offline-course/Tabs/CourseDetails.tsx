import React, { useCallback, useMemo } from "react";
import { PiBook, PiCalendar, PiClock, PiListBullets, PiPlus, PiTrash, PiWarning } from "react-icons/pi";

// Interfaces
interface DetailsErrors {
    courseName: string;
    courseSlug: string
    courseDescription: string;
    courseGoals: string;
    courseLevel: string;
    syllabusOutline: string;
    preRequisites: string
    courseDurationInDays: string;
    courseDurationInHours: string
    courseClassDurationInMin: string;
    courseValidityInMonths: string
}

interface OfflineCourseDetails {
    courseName: string;
    courseSlug: string;
    courseDescription: string;
    courseGoals: string[];
    courseLevel: "Beginner" | "Intermediate" | "Advanced" | "Academic";
    syllabusOutline: string[];
    preRequisites: string[]
    courseDurationInDays: number;
    courseDurationInHours: number
    courseClassDurationInMin: number;
    courseValidityInMonths: number
}

interface DetailsTabProps {
    details: OfflineCourseDetails;
    detailsErrors: DetailsErrors;
    singleSyllabusOutline: string;
    singleCourseGoals: string;
    onDetailsChange: (name: keyof OfflineCourseDetails, value: any) => void;
    onSyllabusOutlineChange: (value: string) => void;
    onCourseGoalsChange: (value: string) => void;
    onAddSyllabusOutline: (value: string) => void;
    onRemoveSyllabusOutline: (index: number) => void;
    onAddCourseGoals: (value: string) => void;
    onRemoveCourseGoals: (index: number) => void;
}

// Component
const DetailsTab: React.FC<DetailsTabProps> = ({
    details,
    detailsErrors,
    singleSyllabusOutline,
    singleCourseGoals,
    onDetailsChange,
    onSyllabusOutlineChange,
    onCourseGoalsChange,
    onAddSyllabusOutline,
    onRemoveSyllabusOutline,
    onAddCourseGoals,
    onRemoveCourseGoals,
}) => {
    const courseLevelOptions = ["Beginner", "Intermediate", "Advanced", "Academic"];

    // Handle input changes
    const handleDetails = useCallback(
        (name: keyof OfflineCourseDetails, value: string) => {
            const parsedValue =
                name.includes("Duration") ? parseInt(value) || 0 : value;
            onDetailsChange(name, parsedValue);
        },
        [onDetailsChange]
    );

    // Handle add syllabus outline
    const handleAddSyllabusOutline = useCallback(() => {
        const trimmed = singleSyllabusOutline.trim();
        if (trimmed) {
            onAddSyllabusOutline(trimmed);
        }
    }, [singleSyllabusOutline, onAddSyllabusOutline]);

    // Handle add course goal
    const handleAddCourseGoals = useCallback(() => {
        const trimmed = singleCourseGoals.trim();
        if (trimmed) {
            onAddCourseGoals(trimmed);
        }
    }, [singleCourseGoals, onAddCourseGoals]);
    // Handle add course goal

    // Memoized component
    const DetailsContent = useMemo(
        () => (
            <div className="space-y-6 min-w-[64rem]">
                <h1 className="text-4xl font-bold text-orange-600 text-shadow-xl">
                    Course Basic Details
                </h1>
                <div className="grid grid-cols-2 gap-6">
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
                                onChange={(e) => handleDetails("courseName", e.target.value)}
                                className={`pl-10 outline-none w-full rounded-lg border ${detailsErrors.courseName
                                        ? "border-red-500"
                                        : details.courseName
                                            ? "border-orange-500"
                                            : "border-stone-300 dark:border-stone-700"
                                    } bg-stone-100 dark:bg-stone-800 py-2 px-3 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                                placeholder="30 Days Javascript"
                                maxLength={100}
                                aria-invalid={!!detailsErrors.courseName}
                                aria-describedby="courseName-error"
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
                        </div>
                    </div>
                    {/* Course Slug */}
                    <div className="space-y-1">
                        <label htmlFor="courseSlug" className="text-orange-600 font-bold">
                            Course Slug
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <PiBook className="h-5 w-5 text-stone-400" />
                            </div>
                            <input
                                id="courseSlug"
                                name="courseSlug"
                                type="text"
                                required
                                value={details.courseName}
                                onChange={(e) => handleDetails("courseName", e.target.value)}
                                className={`pl-10 outline-none w-full rounded-lg border ${detailsErrors.courseName
                                        ? "border-red-500"
                                        : details.courseName
                                            ? "border-orange-500"
                                            : "border-stone-300 dark:border-stone-700"
                                    } bg-stone-100 dark:bg-stone-800 py-2 px-3 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                                placeholder="30 Days Javascript"
                                maxLength={100}
                                aria-invalid={!!detailsErrors.courseName}
                                aria-describedby="courseName-error"
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
                                onChange={(e) => handleDetails("courseLevel", e.target.value)}
                                className={`pl-10 outline-none w-full rounded-lg border ${detailsErrors.courseLevel
                                        ? "border-red-500"
                                        : details.courseLevel
                                            ? "border-orange-500"
                                            : "border-stone-300 dark:border-stone-700"
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

                    {/* Daily Duration */}
                    <div className="space-y-1">
                        <label
                            htmlFor="courseDailyClassDurationInMinutes"
                            className="text-orange-600 font-bold"
                        >
                            Daily Course Duration (Minutes)
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <PiClock className="h-5 w-5 text-stone-400" />
                            </div>
                            <input
                                id="courseDailyClassDurationInMinutes"
                                name="courseDailyClassDurationInMinutes"
                                type="number"
                                required
                                min="1"
                                value={details.courseClassDurationInMin || ""}
                                onChange={(e) =>
                                    handleDetails("courseClassDurationInMin", e.target.value)
                                }
                                className={`pl-10 outline-none w-full rounded-lg border ${detailsErrors.courseClassDurationInMin
                                        ? "border-red-500"
                                        : details.courseClassDurationInMin
                                            ? "border-orange-500"
                                            : "border-stone-300 dark:border-stone-700"
                                    } bg-stone-100 dark:bg-stone-800 py-2 px-3 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                                placeholder="60"
                                aria-invalid={!!detailsErrors.courseClassDurationInMin}
                                aria-describedby="dailyDuration-error"
                                aria-required="true"
                            />
                        </div>
                        <div aria-live="polite">
                            {detailsErrors.courseClassDurationInMin && (
                                <p
                                    id="dailyDuration-error"
                                    className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
                                >
                                    <PiWarning size={16} /> {detailsErrors.courseClassDurationInMin}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Course Duration */}
                    <div className="space-y-1">
                        <label htmlFor="courseDurationInDays" className="text-orange-600 font-bold">
                            Course Duration (Days)
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <PiCalendar className="h-5 w-5 text-stone-400" />
                            </div>
                            <input
                                id="courseDurationInDays"
                                name="courseDurationInDays"
                                type="number"
                                required
                                min="1"
                                value={details.courseDurationInDays || ""}
                                onChange={(e) => handleDetails("courseDurationInDays", e.target.value)}
                                className={`pl-10 outline-none w-full rounded-lg border ${detailsErrors.courseDurationInDays
                                        ? "border-red-500"
                                        : details.courseDurationInDays
                                            ? "border-orange-500"
                                            : "border-stone-300 dark:border-stone-700"
                                    } bg-stone-100 dark:bg-stone-800 py-2 px-3 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                                placeholder="30"
                                aria-invalid={!!detailsErrors.courseDurationInDays}
                                aria-describedby="duration-error"
                                aria-required="true"
                            />
                        </div>
                        <div aria-live="polite">
                            {detailsErrors.courseDurationInDays && (
                                <p
                                    id="duration-error"
                                    className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
                                >
                                    <PiWarning size={16} /> {detailsErrors.courseDurationInDays}
                                </p>
                            )}
                        </div>
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
                                        ? "border-red-500"
                                        : singleSyllabusOutline
                                            ? "border-orange-500"
                                            : "border-stone-300 dark:border-stone-700"
                                    } bg-stone-100 dark:bg-stone-800 py-2 px-3 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                                placeholder="Introduction to Statistics"
                                maxLength={100}
                                aria-invalid={!!detailsErrors.syllabusOutline}
                                aria-describedby="syllabusOutline-error"
                            />
                            <button
                                type="button"
                                onClick={handleAddSyllabusOutline}
                                className="p-2 h-10 w-10 rounded flex items-center justify-center cursor-pointer bg-orange-600 text-stone-100 dark:text-stone-900 hover:bg-orange-500"
                                aria-label="Add syllabus outline"
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
                    </div>
                    <div className="flex mt-4 gap-4 flex-wrap">
                        {details.syllabusOutline.map((syllabusOutline, index) => (
                            <span
                                key={index}
                                className="flex gap-2 px-3 py-1 text-orange-600 rounded font-bold bg-stone-500/50 dark:bg-stone-800"
                            >
                                <p>{syllabusOutline}</p>
                                <button
                                    type="button"
                                    onClick={() => onRemoveSyllabusOutline(index)}
                                    className="cursor-pointer hover:text-red-600"
                                    aria-label={`Remove ${syllabusOutline}`}
                                >
                                    <PiTrash />
                                </button>
                            </span>
                        ))}
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
                                        ? "border-red-500"
                                        : singleCourseGoals
                                            ? "border-orange-500"
                                            : "border-stone-300 dark:border-stone-700"
                                    } bg-stone-100 dark:bg-stone-800 py-2 px-3 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                                placeholder="Master JavaScript fundamentals"
                                maxLength={100}
                                aria-invalid={!!detailsErrors.courseGoals}
                                aria-describedby="courseGoals-error"
                            />
                            <button
                                type="button"
                                onClick={handleAddCourseGoals}
                                className="p-2 h-10 w-10 rounded flex items-center justify-center cursor-pointer bg-orange-600 text-stone-100 dark:text-stone-900 hover:bg-orange-500"
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
                    </div>
                    <div className="flex mt-4 gap-4 flex-wrap">
                        {details.courseGoals.map((goal, index) => (
                            <span
                                key={index}
                                className="flex gap-2 px-3 py-1 text-orange-600 rounded font-bold bg-stone-100/50 dark:bg-stone-800"
                            >
                                <p>{goal}</p>
                                <button
                                    type="button"
                                    onClick={() => onRemoveCourseGoals(index)}
                                    className="cursor-pointer hover:text-red-600"
                                    aria-label={`Remove ${goal}`}
                                >
                                    <PiTrash />
                                </button>
                            </span>
                        ))}
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
                        value={details.courseDescription}
                        onChange={(e) => handleDetails("courseDescription", e.target.value)}
                        className={`w-full rounded-lg border ${detailsErrors.courseDescription
                                ? "border-red-500"
                                : details.courseDescription
                                    ? "border-orange-500"
                                    : "border-stone-300 dark:border-stone-700"
                            } bg-stone-100 dark:bg-stone-800 py-2 px-3 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent min-h-[100px]`}
                        placeholder="Describe the course (e.g., topics covered, teaching methods)"
                        maxLength={3000}
                        aria-invalid={!!detailsErrors.courseDescription}
                        aria-describedby="courseDescription-error"
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
                    </div>
                    <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
                        {details.courseDescription.length}/3000 characters
                    </p>
                </div>
            </div>
        ),
        [
            details,
            detailsErrors,
            singleSyllabusOutline,
            singleCourseGoals,
            handleDetails,
            onSyllabusOutlineChange,
            handleAddSyllabusOutline,
            onRemoveSyllabusOutline,
            onCourseGoalsChange,
            handleAddCourseGoals,
            onRemoveCourseGoals,
        ]
    );

    return DetailsContent;
};

export default DetailsTab;