import React, { useState } from 'react';
import { PiBook, PiCalendar, PiClock, PiListBullets, PiPlus, PiTrash, PiWarning } from 'react-icons/pi';

interface DetailsErrors {
    courseName: string;
    courseSlug: string;
    courseDescription: string;
    courseGoals: string;
    courseLevel: string;
    syllabusOutline: string;
    preRequisites: string;
    courseDurationInDays: string;
    courseDurationInHours: string;
    courseClassDurationInMin: string;
    courseValidityInMonths: string;
}

interface OfflineCourseDetails {
    courseName: string;
    courseSlug: string;
    courseDescription: string;
    courseGoals: string[];
    courseLevel: "Beginner" | "Intermediate" | "Advanced" | "Academic";
    syllabusOutline: string[];
    preRequisites: string[];
    courseDurationInDays: number;
    courseDurationInHours: number;
    courseClassDurationInMin: number;
    courseValidityInMonths: number;
}

interface DetailsTabProps {
    coreDetails: OfflineCourseDetails;
    handleCoreDetailsChange: (name: keyof OfflineCourseDetails, value: any) => void;
    coreDetailsErrors: DetailsErrors;
    courseType: string;
}

const courseLevelOptions = ["Beginner", "Intermediate", "Advanced", "Academic"] as const;

const DetailsTab: React.FC<DetailsTabProps> = ({ 
    coreDetails, 
    handleCoreDetailsChange, 
    coreDetailsErrors, 
    courseType 
}) => {
    const [singleSyllabusOutline, setSingleSyllabusOutline] = useState('');
    const [singlePrerequisites, setSinglePreRequisites] = useState('');
    const [singleCourseGoal, setSingleCourseGoal] = useState('');

    const handleAddSyllabusOutline = () => {
        if (singleSyllabusOutline.trim()) {
            const updatedSyllabus = [...coreDetails.syllabusOutline, singleSyllabusOutline.trim()];
            handleCoreDetailsChange('syllabusOutline', updatedSyllabus);
            setSingleSyllabusOutline('');
        }
    };

    const handleRemoveSyllabusOutline = (index: number) => {
        const updatedSyllabus = [...coreDetails.syllabusOutline];
        updatedSyllabus.splice(index, 1);
        handleCoreDetailsChange('syllabusOutline', updatedSyllabus);
    };

    const handleAddPreRequisites = () => {
        if (singlePrerequisites.trim()) {
            const updatedPrerequisites = [...coreDetails.preRequisites, singlePrerequisites.trim()];
            handleCoreDetailsChange('preRequisites', updatedPrerequisites);
            setSinglePreRequisites('');
        }
    };

    const handleRemovePreRequisites = (index: number) => {
        const updatedPrerequisites = [...coreDetails.preRequisites];
        updatedPrerequisites.splice(index, 1);
        handleCoreDetailsChange('preRequisites', updatedPrerequisites);
    };

    const handleAddCourseGoals = () => {
        if (singleCourseGoal.trim()) {
            const updatedGoals = [...coreDetails.courseGoals, singleCourseGoal.trim()];
            handleCoreDetailsChange('courseGoals', updatedGoals);
            setSingleCourseGoal('');
        }
    };

    const handleRemoveCourseGoals = (index: number) => {
        const updatedGoals = [...coreDetails.courseGoals];
        updatedGoals.splice(index, 1);
        handleCoreDetailsChange('courseGoals', updatedGoals);
    };

    const handleInputKeyDown = (
        e: React.KeyboardEvent,
        value: string,
        addHandler: () => void,
        clearHandler: () => void
    ) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (value.trim()) {
                addHandler();
                clearHandler();
            }
        }
    };

    return (
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
                            value={coreDetails.courseName}
                            onChange={(e) => handleCoreDetailsChange('courseName', e.target.value)}
                            className={`pl-10 outline-none w-full rounded-lg border ${
                                coreDetailsErrors.courseName
                                    ? "border-red-500"
                                    : coreDetails.courseName
                                    ? "border-orange-500"
                                    : "border-stone-300 dark:border-stone-700"
                            } bg-stone-100 dark:bg-stone-800 py-2 px-3 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                            placeholder="30 Days JavaScript"
                            maxLength={100}
                            aria-invalid={!!coreDetailsErrors.courseName}
                            aria-describedby="courseName-error"
                            aria-required="true"
                        />
                    </div>
                    <div aria-live="polite">
                        {coreDetailsErrors.courseName && (
                            <p id="courseName-error" className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                                <PiWarning size={16} /> {coreDetailsErrors.courseName}
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
                            value={coreDetails.courseSlug}
                            onChange={(e) => handleCoreDetailsChange('courseSlug', e.target.value)}
                            className={`pl-10 outline-none w-full rounded-lg border ${
                                coreDetailsErrors.courseSlug
                                    ? "border-red-500"
                                    : coreDetails.courseSlug
                                    ? "border-orange-500"
                                    : "border-stone-300 dark:border-stone-700"
                            } bg-stone-100 dark:bg-stone-800 py-2 px-3 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                            placeholder="30-days-javascript"
                            maxLength={100}
                            aria-invalid={!!coreDetailsErrors.courseSlug}
                            aria-describedby="courseSlug-error"
                            aria-required="true"
                        />
                    </div>
                    <div aria-live="polite">
                        {coreDetailsErrors.courseSlug && (
                            <p id="courseSlug-error" className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                                <PiWarning size={16} /> {coreDetailsErrors.courseSlug}
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
                            value={coreDetails.courseLevel}
                            onChange={(e) => handleCoreDetailsChange(
                                'courseLevel', 
                                e.target.value as "Beginner" | "Intermediate" | "Advanced" | "Academic"
                            )}
                            className={`pl-10 outline-none w-full rounded-lg border ${
                                coreDetailsErrors.courseLevel
                                    ? "border-red-500"
                                    : coreDetails.courseLevel
                                    ? "border-orange-500"
                                    : "border-stone-300 dark:border-stone-700"
                            } bg-stone-100 dark:bg-stone-800 py-2 px-3 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                            aria-invalid={!!coreDetailsErrors.courseLevel}
                            aria-describedby="courseLevel-error"
                            aria-required="true"
                        >
                            {courseLevelOptions.map((option) => (
                                <option key={option} value={option}>
                                    {option}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div aria-live="polite">
                        {coreDetailsErrors.courseLevel && (
                            <p id="courseLevel-error" className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                                <PiWarning size={16} /> {coreDetailsErrors.courseLevel}
                            </p>
                        )}
                    </div>
                </div>

                {/* Daily Class Duration */}
                {courseType === 'offline' && (
                    <div className="space-y-1">
                        <label htmlFor="courseClassDurationInMin" className="text-orange-600 font-bold">
                            Daily Class Duration (Minutes)
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <PiClock className="h-5 w-5 text-stone-400" />
                            </div>
                            <input
                                id="courseClassDurationInMin"
                                name="courseClassDurationInMin"
                                type="number"
                                required
                                min="1"
                                value={coreDetails.courseClassDurationInMin || ''}
                                onChange={(e) => handleCoreDetailsChange(
                                    'courseClassDurationInMin', 
                                    parseInt(e.target.value) || 0
                                )}
                                className={`pl-10 outline-none w-full rounded-lg border ${
                                    coreDetailsErrors.courseClassDurationInMin
                                        ? "border-red-500"
                                        : coreDetails.courseClassDurationInMin
                                        ? "border-orange-500"
                                        : "border-stone-300 dark:border-stone-700"
                                } bg-stone-100 dark:bg-stone-800 py-2 px-3 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                                placeholder="60"
                                aria-invalid={!!coreDetailsErrors.courseClassDurationInMin}
                                aria-describedby="courseClassDurationInMin-error"
                                aria-required="true"
                            />
                        </div>
                        <div aria-live="polite">
                            {coreDetailsErrors.courseClassDurationInMin && (
                                <p id="courseClassDurationInMin-error" className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                                    <PiWarning size={16} /> {coreDetailsErrors.courseClassDurationInMin}
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {/* Course Duration */}
                <div className="space-y-1">
                    <label htmlFor="courseDuration" className="text-orange-600 font-bold">
                        {courseType === 'offline' ? 'Course Duration (Days)' : 'Course Duration (Hours)'}
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <PiCalendar className="h-5 w-5 text-stone-400" />
                        </div>
                        <input
                            id={courseType === 'offline' ? "courseDurationInDays" : "courseDurationInHours"}
                            name={courseType === 'offline' ? "courseDurationInDays" : "courseDurationInHours"}
                            type="number"
                            required
                            min="1"
                            value={
                                courseType === 'offline' 
                                    ? coreDetails.courseDurationInDays || '' 
                                    : coreDetails.courseDurationInHours || ''
                            }
                            onChange={(e) => handleCoreDetailsChange(
                                courseType === 'offline' ? 'courseDurationInDays' : 'courseDurationInHours',
                                parseInt(e.target.value) || 0
                            )}
                            className={`pl-10 outline-none w-full rounded-lg border ${
                                courseType === 'offline'
                                    ? coreDetailsErrors.courseDurationInDays
                                        ? "border-red-500"
                                        : coreDetails.courseDurationInDays
                                        ? "border-orange-500"
                                        : "border-stone-300 dark:border-stone-700"
                                    : coreDetailsErrors.courseDurationInHours
                                        ? "border-red-500"
                                        : coreDetails.courseDurationInHours
                                        ? "border-orange-500"
                                        : "border-stone-300 dark:border-stone-700"
                            } bg-stone-100 dark:bg-stone-800 py-2 px-3 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                            placeholder={courseType === 'offline' ? "30" : "10"}
                            aria-invalid={
                                courseType === 'offline'
                                    ? !!coreDetailsErrors.courseDurationInDays
                                    : !!coreDetailsErrors.courseDurationInHours
                            }
                            aria-describedby={
                                courseType === 'offline' 
                                    ? "courseDurationInDays-error" 
                                    : "courseDurationInHours-error"
                            }
                            aria-required="true"
                        />
                    </div>
                    <div aria-live="polite">
                        {courseType === 'offline' ? (
                            coreDetailsErrors.courseDurationInDays && (
                                <p id="courseDurationInDays-error" className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                                    <PiWarning size={16} /> {coreDetailsErrors.courseDurationInDays}
                                </p>
                            )
                        ) : (
                            coreDetailsErrors.courseDurationInHours && (
                                <p id="courseDurationInHours-error" className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                                    <PiWarning size={16} /> {coreDetailsErrors.courseDurationInHours}
                                </p>
                            )
                        )}
                    </div>
                </div>

                {/* Course Validity (Months) */}
                {courseType !== 'offline' && (
                    <div className="space-y-1">
                        <label htmlFor="courseValidityInMonths" className="text-orange-600 font-bold">
                            Course Validity (Months)
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <PiCalendar className="h-5 w-5 text-stone-400" />
                            </div>
                            <input
                                id="courseValidityInMonths"
                                name="courseValidityInMonths"
                                type="number"
                                required
                                min="1"
                                value={coreDetails.courseValidityInMonths || ''}
                                onChange={(e) => handleCoreDetailsChange(
                                    'courseValidityInMonths', 
                                    parseInt(e.target.value) || 0
                                )}
                                className={`pl-10 outline-none w-full rounded-lg border ${
                                    coreDetailsErrors.courseValidityInMonths
                                        ? "border-red-500"
                                        : coreDetails.courseValidityInMonths
                                        ? "border-orange-500"
                                        : "border-stone-300 dark:border-stone-700"
                                } bg-stone-100 dark:bg-stone-800 py-2 px-3 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                                placeholder="12"
                                aria-invalid={!!coreDetailsErrors.courseValidityInMonths}
                                aria-describedby="courseValidityInMonths-error"
                                aria-required="true"
                            />
                        </div>
                        <div aria-live="polite">
                            {coreDetailsErrors.courseValidityInMonths && (
                                <p id="courseValidityInMonths-error" className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                                    <PiWarning size={16} /> {coreDetailsErrors.courseValidityInMonths}
                                </p>
                            )}
                        </div>
                    </div>
                )}
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
                            onChange={(e) => setSingleSyllabusOutline(e.target.value)}
                            onKeyDown={(e) => handleInputKeyDown(
                                e, 
                                singleSyllabusOutline, 
                                handleAddSyllabusOutline, 
                                () => setSingleSyllabusOutline('')
                            )}
                            className={`pl-10 outline-none w-full rounded-lg border ${
                                coreDetailsErrors.syllabusOutline
                                    ? "border-red-500"
                                    : singleSyllabusOutline
                                    ? "border-orange-500"
                                    : "border-stone-300 dark:border-stone-700"
                            } bg-stone-100 dark:bg-stone-800 py-2 px-3 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                            placeholder="Introduction to Statistics"
                            maxLength={100}
                            aria-invalid={!!coreDetailsErrors.syllabusOutline}
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
                    {coreDetailsErrors.syllabusOutline && (
                        <p id="syllabusOutline-error" className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                            <PiWarning size={16} /> {coreDetailsErrors.syllabusOutline}
                        </p>
                    )}
                </div>
                <div className="flex mt-4 gap-4 flex-wrap">
                    {coreDetails.syllabusOutline.map((item, index) => (
                        <span
                            key={index}
                            className="flex gap-2 px-3 py-1 text-orange-600 rounded font-bold bg-stone-100/50 dark:bg-stone-800"
                        >
                            <p>{item}</p>
                            <button
                                type="button"
                                onClick={() => handleRemoveSyllabusOutline(index)}
                                className="cursor-pointer hover:text-red-600"
                                aria-label={`Remove ${item}`}
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
                            value={singleCourseGoal}
                            onChange={(e) => setSingleCourseGoal(e.target.value)}
                            onKeyDown={(e) => handleInputKeyDown(
                                e, 
                                singleCourseGoal, 
                                handleAddCourseGoals, 
                                () => setSingleCourseGoal('')
                            )}
                            className={`pl-10 outline-none w-full rounded-lg border ${
                                coreDetailsErrors.courseGoals
                                    ? "border-red-500"
                                    : singleCourseGoal
                                    ? "border-orange-500"
                                    : "border-stone-300 dark:border-stone-700"
                            } bg-stone-100 dark:bg-stone-800 py-2 px-3 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                            placeholder="Master JavaScript fundamentals"
                            maxLength={100}
                            aria-invalid={!!coreDetailsErrors.courseGoals}
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
                    {coreDetailsErrors.courseGoals && (
                        <p id="courseGoals-error" className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                            <PiWarning size={16} /> {coreDetailsErrors.courseGoals}
                        </p>
                    )}
                </div>
                <div className="flex mt-4 gap-4 flex-wrap">
                    {coreDetails.courseGoals.map((goal, index) => (
                        <span
                            key={index}
                            className="flex gap-2 px-3 py-1 text-orange-600 rounded font-bold bg-stone-100/50 dark:bg-stone-800"
                        >
                            <p>{goal}</p>
                            <button
                                type="button"
                                onClick={() => handleRemoveCourseGoals(index)}
                                className="cursor-pointer hover:text-red-600"
                                aria-label={`Remove ${goal}`}
                            >
                                <PiTrash />
                            </button>
                        </span>
                    ))}
                </div>
            </div>

            {/* Prerequisites */}
            <div className="space-y-1">
                <label htmlFor="preRequisites" className="text-orange-600 font-bold">
                    Prerequisites
                </label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <PiListBullets className="h-5 w-5 text-stone-400" />
                    </div>
                    <div className="flex items-center gap-2">
                        <input
                            id="preRequisites"
                            name="preRequisites"
                            type="text"
                            value={singlePrerequisites}
                            onChange={(e) => setSinglePreRequisites(e.target.value)}
                            onKeyDown={(e) => handleInputKeyDown(
                                e, 
                                singlePrerequisites, 
                                handleAddPreRequisites, 
                                () => setSinglePreRequisites('')
                            )}
                            className={`pl-10 outline-none w-full rounded-lg border ${
                                singlePrerequisites
                                    ? "border-orange-500"
                                    : "border-stone-300 dark:border-stone-700"
                            } bg-stone-100 dark:bg-stone-800 py-2 px-3 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                            placeholder="Basic programming knowledge"
                            maxLength={100}
                        />
                        <button
                            type="button"
                            onClick={handleAddPreRequisites}
                            className="p-2 h-10 w-10 rounded flex items-center justify-center cursor-pointer bg-orange-600 text-stone-100 dark:text-stone-900 hover:bg-orange-500"
                            aria-label="Add prerequisite"
                        >
                            <PiPlus />
                        </button>
                    </div>
                </div>
                <div className="flex mt-4 gap-4 flex-wrap">
                    {coreDetails.preRequisites.map((item, index) => (
                        <span
                            key={index}
                            className="flex gap-2 px-3 py-1 text-orange-600 rounded font-bold bg-stone-100/50 dark:bg-stone-800"
                        >
                            <p>{item}</p>
                            <button
                                type="button"
                                onClick={() => handleRemovePreRequisites(index)}
                                className="cursor-pointer hover:text-red-600"
                                aria-label={`Remove ${item}`}
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
                    value={coreDetails.courseDescription}
                    onChange={(e) => handleCoreDetailsChange('courseDescription', e.target.value)}
                    className={`w-full rounded-lg border ${
                        coreDetailsErrors.courseDescription
                            ? "border-red-500"
                            : coreDetails.courseDescription
                            ? "border-orange-500"
                            : "border-stone-300 dark:border-stone-700"
                    } bg-stone-100 dark:bg-stone-800 py-2 px-3 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent min-h-[100px]`}
                    placeholder="Describe the course (e.g., topics covered, teaching methods)"
                    maxLength={3000}
                    aria-invalid={!!coreDetailsErrors.courseDescription}
                    aria-describedby="courseDescription-error"
                    aria-required="true"
                />
                <div aria-live="polite">
                    {coreDetailsErrors.courseDescription && (
                        <p id="courseDescription-error" className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                            <PiWarning size={16} /> {coreDetailsErrors.courseDescription}
                        </p>
                    )}
                </div>
                <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
                    {coreDetails.courseDescription.length}/3000 characters
                </p>
            </div>
        </div>
    );
};

export default DetailsTab;