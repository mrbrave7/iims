"use client";
import { Types } from "mongoose";
import React, { useCallback, useEffect, useState, useRef } from "react";
import { PiAddressBook, PiWarning, PiPlus, PiTrash, PiX, PiUser } from "react-icons/pi";
import validator from "validator";
import { debounce } from "lodash";
import DOMPurify from "dompurify";

// Interfaces
interface FreeCourseModule {
    moduleTitle: string;
    moduleDescription?: string;
    moduleDurationInDays: number;
    moduleVideoUrl: string;
    notes: string[];
    articleLinks: string[];
    moduleBannerUrl?: string;
    learningObjectives: string[];
    order: number;
}

interface FreeCourseModuleError {
    moduleTitle: string;
    moduleDescription: string;
    moduleDurationInDays: string;
    moduleVideoUrl: string;
    notes: string;
    articleLinks: string;
    moduleBannerUrl: string;
    learningObjectives?: string;
    order: string;
}

interface FreeCourse {
    courseName: string;
    courseSlug: string;
    courseDescription: string;
    courseDurationInHours: number;
    courseStatus: "Available" | "Unavailable" | "Archived" | "Draft";
    seoMetaTitle?: string;
    seoMetaDescription?: string;
    promoVideoUrl?: string;
    courseBannerUrl?: string;
    courseGoals: string[];
    syllabusOutline: string[];
    modules: FreeCourseModule[];
    courseLevel: "Beginner" | "Intermediate" | "Advanced";
    targetAudience: string[];
    availableLanguages: string[];
    courseCategory: string;
    courseSubCategory: string;
    certificateTemplateUrl: string;
    trendingScore: number;
    courseInstructor: string;
}

interface Course_Instructor {
    id: string;
    profile_details: {
        id: string;
        avatarUrl: string;
        fullName: string;
    };
}

interface FreeCourseErrors {
    courseName: string;
    courseSlug: string;
    courseDescription: string;
    courseDurationInHours: string;
    courseStatus: string;
    seoMetaTitle: string;
    seoMetaDescription: string;
    promoVideoUrl: string;
    courseBannerUrl: string;
    courseGoals: string;
    syllabusOutline: string;
    modules: string;
    courseLevel: string;
    targetAudience: string;
    availableLanguages: string;
    courseCategory: string;
    courseSubCategory: string;
    certificateTemplateUrl: string;
    trendingScore: string;
    courseInstructor: string;
    form?: string;
}

// Utility function to validate MongoDB ObjectId
const isValidObjectId = (id: string) => {
    return Types.ObjectId.isValid(id);
};

// Validation function for course data
const validateCourse = (data: FreeCourse): FreeCourseErrors => {
    const errors: FreeCourseErrors = {
        courseName: "",
        courseSlug: "",
        courseDescription: "",
        courseDurationInHours: "",
        courseStatus: "",
        seoMetaTitle: "",
        seoMetaDescription: "",
        promoVideoUrl: "",
        courseBannerUrl: "",
        courseGoals: "",
        syllabusOutline: "",
        modules: "",
        courseLevel: "",
        targetAudience: "",
        availableLanguages: "",
        courseCategory: "",
        courseSubCategory: "",
        certificateTemplateUrl: "",
        trendingScore: "",
        courseInstructor: "",
    };

    if (!data.courseName.trim()) errors.courseName = "Course name is required";
    else if (data.courseName.length > 100)
        errors.courseName = "Course name cannot exceed 100 characters";

    if (!data.courseSlug.trim()) errors.courseSlug = "Course slug is required";
    else if (!/^[a-z0-9-]+$/i.test(data.courseSlug))
        errors.courseSlug = "Slug can only contain letters, numbers, and hyphens";
    else if (data.courseSlug.length > 100)
        errors.courseSlug = "Slug cannot exceed 100 characters";

    if (!data.courseDescription.trim())
        errors.courseDescription = "Course description is required";
    else if (data.courseDescription.length < 50)
        errors.courseDescription = "Description must be at least 50 characters";
    else if (data.courseDescription.length > 1000)
        errors.courseDescription = "Description cannot exceed 1000 characters";

    if (data.courseDurationInHours <= 0)
        errors.courseDurationInHours = "Course duration must be positive";
    else if (data.courseDurationInHours > 1000)
        errors.courseDurationInHours = "Course duration cannot exceed 1000 hours";

    if (!data.courseStatus) errors.courseStatus = "Course status is required";

    if (data.seoMetaTitle && data.seoMetaTitle.length > 60)
        errors.seoMetaTitle = "SEO meta title cannot exceed 60 characters";

    if (data.seoMetaDescription && data.seoMetaDescription.length > 160)
        errors.seoMetaDescription = "SEO meta description cannot exceed 160 characters";

    if (data.promoVideoUrl && !validator.isURL(data.promoVideoUrl))
        errors.promoVideoUrl = "Invalid URL";

    if (data.courseBannerUrl && !validator.isURL(data.courseBannerUrl))
        errors.courseBannerUrl = "Invalid URL";

    if (data.courseGoals.length === 0)
        errors.courseGoals = "At least one goal is required";
    else if (data.courseGoals.some((goal) => goal.length > 500))
        errors.courseGoals = "Each goal cannot exceed 500 characters";

    if (data.syllabusOutline.length === 0)
        errors.syllabusOutline = "At least one syllabus item is required";
    else if (data.syllabusOutline.some((item) => item.length > 500))
        errors.syllabusOutline = "Each syllabus item cannot exceed 500 characters";

    if (data.modules.length === 0)
        errors.modules = "At least one module is required";

    if (!data.courseLevel) errors.courseLevel = "Course level is required";

    if (data.targetAudience.length === 0)
        errors.targetAudience = "At least one target audience is required";
    else if (data.targetAudience.some((audience) => audience.length > 200))
        errors.targetAudience = "Each audience cannot exceed 200 characters";

    if (data.availableLanguages.length === 0)
        errors.availableLanguages = "At least one language is required";
    else if (data.availableLanguages.some((lang) => lang.length > 50))
        errors.availableLanguages = "Each language cannot exceed 50 characters";

    if (!data.courseCategory.trim())
        errors.courseCategory = "Course category is required";
    else if (data.courseCategory.length > 100)
        errors.courseCategory = "Category cannot exceed 100 characters";

    if (!data.courseSubCategory.trim())
        errors.courseSubCategory = "Course sub-category is required";
    else if (data.courseSubCategory.length > 100)
        errors.courseSubCategory = "Sub-category cannot exceed 100 characters";

    if (data.certificateTemplateUrl && !validator.isURL(data.certificateTemplateUrl))
        errors.certificateTemplateUrl = "Invalid URL";

    if (data.trendingScore < 0)
        errors.trendingScore = "Trending score cannot be negative";
    else if (data.trendingScore > 100)
        errors.trendingScore = "Trending score cannot exceed 100";

    if (!data.courseInstructor.trim())
        errors.courseInstructor = "Instructor ID is required";
    else if (!isValidObjectId(data.courseInstructor))
        errors.courseInstructor = "Invalid Instructor ID";

    return errors;
};

// Reusable FormInput component
interface FormInputProps {
    label: string;
    id: string;
    name: string;
    type: string;
    value: string | number;
    onChange: (name: string, value: string | number) => void;
    error?: string;
    placeholder?: string;
    required?: boolean;
    maxLength?: number;
    min?: number;
    icon?: React.ReactNode;
    className?: string;
    onFocus?: () => void;
    onBlur?: () => void;
}

const FormInput: React.FC<FormInputProps> = ({
    label,
    id,
    name,
    type,
    value,
    onChange,
    error,
    placeholder,
    required,
    maxLength,
    min,
    icon,
    className,
    onFocus,
    onBlur,
}) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = type === "number" ? parseInt(e.target.value) || 0 : e.target.value;
        onChange(name, newValue);
    };

    return (
        <div className="space-y-1">
            <label htmlFor={id} className="text-orange-600 font-bold">
                {label}
                {required && <span className="text-red-500">*</span>}
            </label>
            <div className="relative">
                {icon && (
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        {icon}
                    </div>
                )}
                <input
                    id={id}
                    name={name}
                    type={type}
                    value={value}
                    onChange={handleChange}
                    onFocus={onFocus}
                    onBlur={onBlur}
                    className={`w-full rounded-lg border ${error
                        ? "border-red-500"
                        : value
                            ? "border-orange-500"
                            : "border-stone-300 dark:border-stone-700"
                        } bg-stone-100 dark:bg-stone-800 py-2 px-3 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent ${icon ? "pl-10" : ""
                        } ${className || ""}`}
                    placeholder={placeholder}
                    required={required}
                    maxLength={maxLength}
                    min={min}
                    aria-describedby={error ? `${id}-error` : undefined}
                />
            </div>
            {error && (
                <p
                    id={`${id}-error`}
                    className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
                >
                    <PiWarning size={16} /> {error}
                </p>
            )}
            {maxLength && (
                <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
                    {String(value).length}/{maxLength} characters
                </p>
            )}
        </div>
    );
};

// Reusable ArrayInput component
interface ArrayInputProps {
    label: string;
    items: string[];
    singleItem: string;
    setSingleItem: (value: string) => void;
    addItem: () => void;
    removeItem: (index: number) => void;
    placeholder: string;
    maxLength?: number;
}

const ArrayInput: React.FC<ArrayInputProps> = ({
    label,
    items,
    singleItem,
    setSingleItem,
    addItem,
    removeItem,
    placeholder,
    maxLength,
}) => {
    return (
        <div className="space-y-2">
            <label className="text-orange-600 font-bold">{label}</label>
            <div className="flex gap-2">
                <input
                    type="text"
                    value={singleItem}
                    onChange={(e) => setSingleItem(DOMPurify.sanitize(e.target.value))}
                    className="flex-1 rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-100 dark:bg-stone-800 py-2 px-3 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder={placeholder}
                    maxLength={maxLength}
                    aria-label={`Add ${label.toLowerCase()}`}
                />
                <button
                    type="button"
                    onClick={addItem}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center gap-1"
                >
                    <PiPlus /> Add
                </button>
            </div>
            {items.length > 0 && (
                <ul className="space-y-2">
                    {items.map((item, index) => (
                        <li
                            key={index}
                            className="flex items-center justify-between bg-stone-100/50 dark:bg-stone-800/50 text-orange-600 font-bold p-2 rounded-lg"
                        >
                            <span className="truncate">{item}</span>
                            <button
                                type="button"
                                onClick={() => removeItem(index)}
                                className="text-red-500 hover:text-red-700"
                                aria-label={`Remove ${item}`}
                            >
                                <PiTrash />
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

// Module Form component
interface ModuleFormProps {
    singleModule: FreeCourseModule;
    singleModuleError: FreeCourseModuleError;
    setSingleModule: (module: FreeCourseModule) => void;
    setSingleModuleError: (error: FreeCourseModuleError) => void;
    handleAddModule: () => void;
    resetModuleForm: () => void;
    singleNotes: string;
    setSingleNotes: (value: string) => void;
    singleArticleUrl: string;
    setSingleArticleUrl: (value: string) => void;
    singleLearningObjectives: string;
    setSingleLearningObjectives: (value: string) => void;
    handleAddNotesUrl: () => void;
    handleRemoveNotesUrl: (index: number) => void;
    handleAddArticleUrl: () => void;
    handleRemoveArticleUrl: (index: number) => void;
    handleAddLearningObjective: () => void;
    handleRemoveLearningObjective: (index: number) => void;
}

const ModuleForm: React.FC<ModuleFormProps> = ({
    singleModule,
    singleModuleError,
    setSingleModule,
    setSingleModuleError,
    handleAddModule,
    resetModuleForm,
    singleNotes,
    setSingleNotes,
    singleArticleUrl,
    setSingleArticleUrl,
    singleLearningObjectives,
    setSingleLearningObjectives,
    handleAddNotesUrl,
    handleRemoveNotesUrl,
    handleAddArticleUrl,
    handleRemoveArticleUrl,
    handleAddLearningObjective,
    handleRemoveLearningObjective,
}) => {
    const handleModuleDetails = useCallback(
        (name: string, value: string | number) => {
            setSingleModule({ ...singleModule, [name]: value });
        },
        [singleModule, setSingleModule]
    );

    return (
        <div className="fixed inset-0 bg-stone-900/50 h-screen w-screen overflow-y-auto flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-stone-900 rounded-lg shadow-xl mt-20 p-6 w-full max-w-6xl">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-orange-600">Add New Module</h3>
                    <button
                        onClick={resetModuleForm}
                        className="text-stone-500 hover:text-stone-700"
                        aria-label="Close module form"
                    >
                        <PiX size={24} />
                    </button>
                </div>

                <div className="space-y-4">
                    <FormInput
                        label="Module Title"
                        id="moduleTitle"
                        name="moduleTitle"
                        type="text"
                        value={singleModule.moduleTitle}
                        onChange={handleModuleDetails}
                        error={singleModuleError.moduleTitle}
                        placeholder="Module title"
                        required
                        maxLength={100}
                    />

                    <div className="space-y-1">
                        <label htmlFor="moduleDescription" className="text-orange-600 font-bold">
                            Module Description
                        </label>
                        <textarea
                            id="moduleDescription"
                            name="moduleDescription"
                            value={singleModule.moduleDescription || ""}
                            onChange={(e) =>
                                handleModuleDetails("moduleDescription", DOMPurify.sanitize(e.target.value))
                            }
                            rows={3}
                            className="w-full rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-100 dark:bg-stone-800 py-2 px-3 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            placeholder="Describe what this module covers"
                            maxLength={1000}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <FormInput
                            label="Duration (days)"
                            id="moduleDurationInDays"
                            name="moduleDurationInDays"
                            type="number"
                            value={singleModule.moduleDurationInDays}
                            onChange={handleModuleDetails}
                            error={singleModuleError.moduleDurationInDays}
                            required
                            min={1}
                        />

                        <FormInput
                            label="Order"
                            id="moduleOrder"
                            name="order"
                            type="number"
                            value={singleModule.order}
                            onChange={handleModuleDetails}
                            error={singleModuleError.order}
                            required
                            min={1}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <FormInput
                            label="Video URL"
                            id="moduleVideoUrl"
                            name="moduleVideoUrl"
                            type="url"
                            value={singleModule.moduleVideoUrl}
                            onChange={handleModuleDetails}
                            error={singleModuleError.moduleVideoUrl}
                            placeholder="https://youtube.com/embed/..."
                        />

                        <FormInput
                            label="Banner URL"
                            id="moduleBannerUrl"
                            name="moduleBannerUrl"
                            type="url"
                            value={singleModule.moduleBannerUrl || ""}
                            onChange={handleModuleDetails}
                            error={singleModuleError.moduleBannerUrl}
                            placeholder="https://example.com/module-banner.jpg"
                        />
                    </div>

                    <ArrayInput
                        label="Notes"
                        items={singleModule.notes}
                        singleItem={singleNotes}
                        setSingleItem={setSingleNotes}
                        addItem={handleAddNotesUrl}
                        removeItem={handleRemoveNotesUrl}
                        placeholder="Add a note URL"
                        maxLength={500}
                    />

                    <ArrayInput
                        label="Article Links"
                        items={singleModule.articleLinks}
                        singleItem={singleArticleUrl}
                        setSingleItem={setSingleArticleUrl}
                        addItem={handleAddArticleUrl}
                        removeItem={handleRemoveArticleUrl}
                        placeholder="Add an article URL"
                        maxLength={500}
                    />

                    <ArrayInput
                        label="Learning Objectives"
                        items={singleModule.learningObjectives}
                        singleItem={singleLearningObjectives}
                        setSingleItem={setSingleLearningObjectives}
                        addItem={handleAddLearningObjective}
                        removeItem={handleRemoveLearningObjective}
                        placeholder="Add a learning objective"
                        maxLength={500}
                    />

                    <div className="pt-4">
                        <button
                            type="button"
                            onClick={handleAddModule}
                            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-lg"
                        >
                            Add Module
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Main FreeCourseForm component
export default function FreeCourseForm(): React.ReactElement {
    // Initialize state with localStorage
    const [freeCourseData, setFreeCourseData] = useState<FreeCourse>(() => {
        const savedCourse = localStorage.getItem("freeCourseData");
        return savedCourse
            ? JSON.parse(savedCourse)
            : {
                courseName: "",
                courseSlug: "",
                courseDescription: "",
                courseDurationInHours: 0,
                courseStatus: "Available",
                seoMetaTitle: "",
                seoMetaDescription: "",
                promoVideoUrl: "",
                courseBannerUrl: "",
                courseGoals: [],
                syllabusOutline: [],
                modules: [],
                courseLevel: "Beginner",
                targetAudience: [],
                availableLanguages: [],
                courseCategory: "",
                courseSubCategory: "",
                certificateTemplateUrl: "",
                trendingScore: 0,
                courseInstructor: "",
            };
    });

    const [singleModule, setSingleModule] = useState<FreeCourseModule>(() => {
        const savedModule = localStorage.getItem("singleModule");
        return savedModule
            ? JSON.parse(savedModule)
            : {
                moduleTitle: "",
                moduleDescription: "",
                moduleDurationInDays: 0,
                moduleVideoUrl: "",
                notes: [],
                articleLinks: [],
                moduleBannerUrl: "",
                learningObjectives: [],
                order: 0,
            };
    });

    const [singleNotes, setSingleNotes] = useState<string>("");
    const [singleArticleUrl, setSingleArticleUrl] = useState<string>("");
    const [singleLearningObjectives, setSingleLearningObjectives] = useState<string>("");
    const [singleModuleError, setSingleModuleError] = useState<FreeCourseModuleError>({
        moduleTitle: "",
        moduleDescription: "",
        moduleDurationInDays: "",
        moduleVideoUrl: "",
        notes: "",
        articleLinks: "",
        moduleBannerUrl: "",
        learningObjectives: "",
        order: "",
    });

    const [singleCourseGoals, setSingleCourseGoals] = useState<string>("");
    const [singleSyllabusOutline, setSingleSyllabusOutline] = useState<string>("");
    const [singleTargetAudience, setSingleTargetAudience] = useState<string>("");
    const [singleAvailableLanguage, setSingleAvailableLanguage] = useState<string>("");
    const [freeCourseError, setFreeCourseError] = useState<FreeCourseErrors>({
        courseName: "",
        courseSlug: "",
        courseDescription: "",
        courseDurationInHours: "",
        courseStatus: "",
        seoMetaTitle: "",
        seoMetaDescription: "",
        promoVideoUrl: "",
        courseBannerUrl: "",
        courseGoals: "",
        syllabusOutline: "",
        modules: "",
        courseLevel: "",
        targetAudience: "",
        availableLanguages: "",
        courseCategory: "",
        courseSubCategory: "",
        certificateTemplateUrl: "",
        trendingScore: "",
        courseInstructor: "",
    });

    const [instructorSearchField, setInstructorSearchField] = useState<string>("");
    const [instructors, setInstructors] = useState<Course_Instructor[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
    const [showInstructorDropdown, setShowInstructorDropdown] = useState<boolean>(false);
    const instructorInputRef = useRef<HTMLInputElement>(null);

    // Fetch instructors from API
    async function getInstructors() {
        setIsLoading(true);
        setError("");
        try {
            const response = await fetch("/api/admins/batch-instructor");
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to fetch instructors");
            }
            const data = await response.json();
            const { batchInstructors } = data;
            setInstructors(batchInstructors || []);
        } catch (error: any) {
            console.error(error);
            setError(error.message || "An error occurred while fetching instructors");
        } finally {
            setIsLoading(false);
        }
    }

    // Load instructors on mount
    useEffect(() => {
        getInstructors();
    }, []);

    // Clear localStorage on component unmount
    useEffect(() => {
        return () => {
            localStorage.removeItem("freeCourseData");
            localStorage.removeItem("singleModule");
        };
    }, []);

    // Save to localStorage
    useEffect(() => {
        localStorage.setItem("freeCourseData", JSON.stringify(freeCourseData));
    }, [freeCourseData]);

    useEffect(() => {
        localStorage.setItem("singleModule", JSON.stringify(singleModule));
    }, [singleModule]);

    // Handlers
    const handleCourseDetails = useCallback(
        debounce((name: string, value: string | number) => {
            setFreeCourseData((prev) => ({
                ...prev,
                [name]: typeof value === "string" ? DOMPurify.sanitize(value) : value,
            }));
        }, 300),
        []
    );

    const handleAddCourseGoal = useCallback(() => {
        if (!singleCourseGoals.trim() || singleCourseGoals.length > 500) return;
        setFreeCourseData((prev) => ({
            ...prev,
            courseGoals: [...prev.courseGoals, DOMPurify.sanitize(singleCourseGoals)],
        }));
        setSingleCourseGoals("");
    }, [singleCourseGoals]);

    const handleRemoveCourseGoal = useCallback((index: number) => {
        if (window.confirm("Are you sure you want to remove this goal?")) {
            setFreeCourseData((prev) => ({
                ...prev,
                courseGoals: prev.courseGoals.filter((_, i) => i !== index),
            }));
        }
    }, []);

    const handleAddSyllabusOutline = useCallback(() => {
        if (!singleSyllabusOutline.trim() || singleSyllabusOutline.length > 500) return;
        setFreeCourseData((prev) => ({
            ...prev,
            syllabusOutline: [...prev.syllabusOutline, DOMPurify.sanitize(singleSyllabusOutline)],
        }));
        setSingleSyllabusOutline("");
    }, [singleSyllabusOutline]);

    const handleRemoveSyllabusOutline = useCallback((index: number) => {
        if (window.confirm("Are you sure you want to remove this syllabus item?")) {
            setFreeCourseData((prev) => ({
                ...prev,
                syllabusOutline: prev.syllabusOutline.filter((_, i) => i !== index),
            }));
        }
    }, []);

    const handleAddTargetAudience = useCallback(() => {
        if (!singleTargetAudience.trim() || singleTargetAudience.length > 200) return;
        setFreeCourseData((prev) => ({
            ...prev,
            targetAudience: [...prev.targetAudience, DOMPurify.sanitize(singleTargetAudience)],
        }));
        setSingleTargetAudience("");
    }, [singleTargetAudience]);

    const handleRemoveTargetAudience = useCallback((index: number) => {
        if (window.confirm("Are you sure you want to remove this target audience?")) {
            setFreeCourseData((prev) => ({
                ...prev,
                targetAudience: prev.targetAudience.filter((_, i) => i !== index),
            }));
        }
    }, []);

    const handleAddAvailableLanguage = useCallback(() => {
        if (!singleAvailableLanguage.trim() || singleAvailableLanguage.length > 50) return;
        setFreeCourseData((prev) => ({
            ...prev,
            availableLanguages: [
                ...prev.availableLanguages,
                DOMPurify.sanitize(singleAvailableLanguage),
            ],
        }));
        setSingleAvailableLanguage("");
    }, [singleAvailableLanguage]);

    const handleRemoveAvailableLanguage = useCallback((index: number) => {
        if (window.confirm("Are you sure you want to remove this language?")) {
            setFreeCourseData((prev) => ({
                ...prev,
                availableLanguages: prev.availableLanguages.filter((_, i) => i !== index),
            }));
        }
    }, []);

    const handleAddNotesUrl = useCallback(() => {
        if (
            !singleNotes.trim() ||
            singleNotes.length > 500 ||
            !validator.isURL(singleNotes)
        )
            return;
        setSingleModule((prev) => ({
            ...prev,
            notes: [...prev.notes, DOMPurify.sanitize(singleNotes)],
        }));
        setSingleNotes("");
    }, [singleNotes]);

    const handleRemoveNotesUrl = useCallback((index: number) => {
        if (window.confirm("Are you sure you want to remove this note?")) {
            setSingleModule((prev) => ({
                ...prev,
                notes: prev.notes.filter((_, i) => i !== index),
            }));
        }
    }, []);

    const handleAddArticleUrl = useCallback(() => {
        if (
            !singleArticleUrl.trim() ||
            singleArticleUrl.length > 500 ||
            !validator.isURL(singleArticleUrl)
        )
            return;
        setSingleModule((prev) => ({
            ...prev,
            articleLinks: [...prev.articleLinks, DOMPurify.sanitize(singleArticleUrl)],
        }));
        setSingleArticleUrl("");
    }, [singleArticleUrl]);

    const handleRemoveArticleUrl = useCallback((index: number) => {
        if (window.confirm("Are you sure you want to remove this article link?")) {
            setSingleModule((prev) => ({
                ...prev,
                articleLinks: prev.articleLinks.filter((_, i) => i !== index),
            }));
        }
    }, []);

    const handleAddLearningObjective = useCallback(() => {
        if (!singleLearningObjectives.trim() || singleLearningObjectives.length > 500) return;
        setSingleModule((prev) => ({
            ...prev,
            learningObjectives: [
                ...(prev.learningObjectives || []),
                DOMPurify.sanitize(singleLearningObjectives),
            ],
        }));
        setSingleLearningObjectives("");
    }, [singleLearningObjectives]);

    const handleRemoveLearningObjective = useCallback((index: number) => {
        if (window.confirm("Are you sure you want to remove this learning objective?")) {
            setSingleModule((prev) => ({
                ...prev,
                learningObjectives: (prev.learningObjectives || []).filter(
                    (_, i) => i !== index
                ),
            }));
        }
    }, []);

    const handleAddModule = useCallback(() => {
        const newErrors: FreeCourseModuleError = {
            moduleTitle: "",
            moduleDescription: "",
            moduleDurationInDays: "",
            moduleVideoUrl: "",
            notes: "",
            articleLinks: "",
            moduleBannerUrl: "",
            learningObjectives: "",
            order: "",
        };

        let isValid = true;

        if (!singleModule.moduleTitle.trim()) {
            newErrors.moduleTitle = "Module title is required";
            isValid = false;
        } else if (singleModule.moduleTitle.length > 100) {
            newErrors.moduleTitle = "Module title cannot exceed 100 characters";
            isValid = false;
        }

        if (singleModule.moduleDescription && singleModule.moduleDescription.length > 1000) {
            newErrors.moduleDescription = "Description cannot exceed 1000 characters";
            isValid = false;
        }

        if (singleModule.moduleDurationInDays <= 0) {
            newErrors.moduleDurationInDays = "Duration must be positive";
            isValid = false;
        } else if (singleModule.moduleDurationInDays > 365) {
            newErrors.moduleDurationInDays = "Duration cannot exceed 365 days";
            isValid = false;
        }

        if (singleModule.moduleVideoUrl && !validator.isURL(singleModule.moduleVideoUrl)) {
            newErrors.moduleVideoUrl = "Invalid URL";
            isValid = false;
        }

        if (
            singleModule.moduleBannerUrl &&
            !validator.isURL(singleModule.moduleBannerUrl)
        ) {
            newErrors.moduleBannerUrl = "Invalid URL";
            isValid = false;
        }

        if (singleModule.learningObjectives.length === 0) {
            newErrors.learningObjectives = "At least one learning objective is required";
            isValid = false;
        }

        if (singleModule.order <= 0) {
            newErrors.order = "Order must be positive";
            isValid = false;
        } else if (
            freeCourseData.modules.some(
                (m) => m.order === singleModule.order && m !== singleModule
            )
        ) {
            newErrors.order = "Order must be unique";
            isValid = false;
        }

        setSingleModuleError(newErrors);

        if (isValid) {
            setFreeCourseData((prev) => ({
                ...prev,
                modules: [...prev.modules, singleModule],
            }));
            resetModuleForm();
        }
    }, [singleModule, freeCourseData.modules]);

    const handleRemoveModule = useCallback((index: number) => {
        if (window.confirm("Are you sure you want to remove this module?")) {
            setFreeCourseData((prev) => ({
                ...prev,
                modules: prev.modules.filter((_, i) => i !== index),
            }));
        }
    }, []);

    const resetModuleForm = useCallback(() => {
        setSingleModule({
            moduleTitle: "",
            moduleDescription: "",
            moduleDurationInDays: 0,
            moduleVideoUrl: "",
            notes: [],
            articleLinks: [],
            moduleBannerUrl: "",
            learningObjectives: [],
            order:
                freeCourseData.modules.length > 0
                    ? Math.max(...freeCourseData.modules.map((m) => m.order)) + 1
                    : 1,
        });
        setSingleModuleError({
            moduleTitle: "",
            moduleDescription: "",
            moduleDurationInDays: "",
            moduleVideoUrl: "",
            notes: "",
            articleLinks: "",
            moduleBannerUrl: "",
            learningObjectives: "",
            order: "",
        });
        setSingleNotes("");
        setSingleArticleUrl("");
        setSingleLearningObjectives("");
        setShowModuleForm(false);
    }, [freeCourseData.modules]);

    const handleSubmit = useCallback(
        async (e: React.FormEvent) => {
            e.preventDefault();
            setIsSubmitting(true);

            const errors = validateCourse(freeCourseData);
            setFreeCourseError(errors);

            if (Object.values(errors).some((error) => error)) {
                setIsSubmitting(false);
                return;
            }

            try {
                // Replace with actual API call
                const response = await fetch("/api/courses/create-free-course", {
                    method: "POST",
                    credentials:"include",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(freeCourseData),
                });

                if (!response.ok) throw new Error("Failed to create course");

                // // Clear localStorage and reset form
                localStorage.removeItem("freeCourseData");
                localStorage.removeItem("singleModule");
                setFreeCourseData({
                    courseName: "",
                    courseSlug: "",
                    courseDescription: "",
                    courseDurationInHours: 0,
                    courseStatus: "Available",
                    seoMetaTitle: "",
                    seoMetaDescription: "",
                    promoVideoUrl: "",
                    courseBannerUrl: "",
                    courseGoals: [],
                    syllabusOutline: [],
                    modules: [],
                    courseLevel: "Beginner",
                    targetAudience: [],
                    availableLanguages: [],
                    courseCategory: "",
                    courseSubCategory: "",
                    certificateTemplateUrl: "",
                    trendingScore: 0,
                    courseInstructor: "",
                });
                resetModuleForm();
                alert("Course created successfully!");
                const data = await response.json()
                console.log(data)
            } catch (error) {
                console.error("Submission failed:", error);
                setFreeCourseError({ ...freeCourseError, form: "Failed to create course" });
            } finally {
                setIsSubmitting(false);
            }
        },
        [freeCourseData, freeCourseError]
    );

    // Instructor selection handlers
    const handleInstructorFocus = () => {
        setShowInstructorDropdown(true);
    };

    const handleInstructorBlur = () => {
        // Delay hiding dropdown to allow click events
        setTimeout(() => setShowInstructorDropdown(false), 200);
    };

    const handleInstructorSelect = (instructor: Course_Instructor) => {
        setFreeCourseData((prev) => ({
            ...prev,
            courseInstructor: instructor.id,
        }));
        setInstructorSearchField(instructor.profile_details.fullName);
        setShowInstructorDropdown(false);
    };

    // Filter instructors based on search
    const filteredInstructors = instructors.filter((instructor: Course_Instructor) =>
        instructor?.profile_details?.fullName
            .toLowerCase()
            .includes(instructorSearchField.toLowerCase())
    );

    const [showModuleForm, setShowModuleForm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    return (
        <div className="min-h-screen py-8 flex flex-col items-center justify-center bg-gradient-to-br from-orange-200 via-orange-300 to-orange-400 dark:from-stone-800 dark:via-stone-900 dark:to-black">
            <h1 className="text-2xl font-bold text-orange-600 mb-6">Create New Free Course</h1>

            <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-6xl">
                {freeCourseError.form && (
                    <p className="text-red-600 dark:text-red-400 flex items-center gap-1">
                        <PiWarning size={16} /> {freeCourseError.form}
                    </p>
                )}
                {error && (
                    <p className="text-red-600 dark:text-red-400 flex items-center gap-1">
                        <PiWarning size={16} /> {error}
                    </p>
                )}

                {/* Basic Course Information */}
                <section aria-labelledby="basic-info">
                    <h2
                        id="basic-info"
                        className="text-xl font-semibold text-orange-600 border-b border-orange-600 pb-2"
                    >
                        Basic Information
                    </h2>
                    <div className="grid grid-cols-2 gap-4">
                        <FormInput
                            label="Course Name"
                            id="courseName"
                            name="courseName"
                            type="text"
                            value={freeCourseData.courseName}
                            onChange={handleCourseDetails}
                            error={freeCourseError.courseName}
                            placeholder="e.g., Introduction to Web Development"
                            required
                            maxLength={100}
                            icon={<PiAddressBook className="h-5 w-5 text-stone-400" />}
                        />

                        <FormInput
                            label="Course Slug"
                            id="courseSlug"
                            name="courseSlug"
                            type="text"
                            value={freeCourseData.courseSlug}
                            onChange={handleCourseDetails}
                            error={freeCourseError.courseSlug}
                            placeholder="e.g., intro-to-web-dev"
                            required
                            maxLength={100}
                        />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-1">
                            <label htmlFor="courseStatus" className="text-orange-600 font-bold">
                                Course Status<span className="text-red-500">*</span>
                            </label>
                            <select
                                id="courseStatus"
                                name="courseStatus"
                                value={freeCourseData.courseStatus}
                                onChange={(e) => handleCourseDetails("courseStatus", e.target.value)}
                                className="w-full rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-100 dark:bg-stone-800 py-2 px-3 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                required
                            >
                                <option value="Available">Available</option>
                                <option value="Unavailable">Unavailable</option>
                                <option value="Archived">Archived</option>
                                <option value="Draft">Draft</option>
                            </select>
                        </div>

                        <div className="space-y-1">
                            <label htmlFor="courseLevel" className="text-orange-600 font-bold">
                                Course Level<span className="text-red-500">*</span>
                            </label>
                            <select
                                id="courseLevel"
                                name="courseLevel"
                                value={freeCourseData.courseLevel}
                                onChange={(e) => handleCourseDetails("courseLevel", e.target.value)}
                                className="w-full rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-100 dark:bg-stone-800 py-2 px-3 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                required
                            >
                                <option value="Beginner">Beginner</option>
                                <option value="Intermediate">Intermediate</option>
                                <option value="Advanced">Advanced</option>
                            </select>
                        </div>

                        <FormInput
                            label="Course Duration (hours)"
                            id="courseDurationInHours"
                            name="courseDurationInHours"
                            type="number"
                            value={freeCourseData.courseDurationInHours}
                            onChange={handleCourseDetails}
                            error={freeCourseError.courseDurationInHours}
                            placeholder="e.g., 10"
                            required
                            min={1}
                        />
                    </div>

                    <div className="space-y-1">
                        <label htmlFor="courseDescription" className="text-orange-600 font-bold">
                            Course Description<span className="text-red-500">*</span>
                        </label>
                        <textarea
                            id="courseDescription"
                            name="courseDescription"
                            value={freeCourseData.courseDescription}
                            onChange={(e) =>
                                handleCourseDetails("courseDescription", DOMPurify.sanitize(e.target.value))
                            }
                            rows={4}
                            className={`w-full rounded-lg border ${freeCourseError.courseDescription
                                ? "border-red-500"
                                : freeCourseData.courseDescription
                                    ? "border-orange-500"
                                    : "border-stone-300 dark:border-stone-700"
                                } bg-stone-100 dark:bg-stone-800 py-2 px-3 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                            placeholder="Describe what this course is about..."
                            required
                            maxLength={1000}
                        />
                        {freeCourseError.courseDescription && (
                            <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                                <PiWarning size={16} /> {freeCourseError.courseDescription}
                            </p>
                        )}
                    </div>
                </section>

                {/* Media & SEO */}
                <section aria-labelledby="media-seo">
                    <h2
                        id="media-seo"
                        className="text-xl font-semibold text-orange-600 border-b border-orange-600 pb-2"
                    >
                        Media & SEO
                    </h2>
                    <div className="grid grid-cols-2 gap-4">
                        <FormInput
                            label="Promo Video URL"
                            id="promoVideoUrl"
                            name="promoVideoUrl"
                            type="url"
                            value={freeCourseData.promoVideoUrl || ""}
                            onChange={handleCourseDetails}
                            error={freeCourseError.promoVideoUrl}
                            placeholder="https://youtube.com/embed/..."
                        />

                        <FormInput
                            label="Course Banner URL"
                            id="courseBannerUrl"
                            name="courseBannerUrl"
                            type="url"
                            value={freeCourseData.courseBannerUrl || ""}
                            onChange={handleCourseDetails}
                            error={freeCourseError.courseBannerUrl}
                            placeholder="https://example.com/banner.jpg"
                        />
                    </div>

                    <FormInput
                        label="SEO Meta Title"
                        id="seoMetaTitle"
                        name="seoMetaTitle"
                        type="text"
                        value={freeCourseData.seoMetaTitle || ""}
                        onChange={handleCourseDetails}
                        error={freeCourseError.seoMetaTitle}
                        placeholder="SEO title for search engines"
                        maxLength={60}
                    />

                    <div className="space-y-1">
                        <label htmlFor="seoMetaDescription" className="text-orange-600 font-bold">
                            SEO Meta Description
                        </label>
                        <textarea
                            id="seoMetaDescription"
                            name="seoMetaDescription"
                            value={freeCourseData.seoMetaDescription || ""}
                            onChange={(e) =>
                                handleCourseDetails("seoMetaDescription", DOMPurify.sanitize(e.target.value))
                            }
                            rows={2}
                            className={`w-full rounded-lg border ${freeCourseError.seoMetaDescription
                                ? "border-red-500"
                                : freeCourseData.seoMetaDescription
                                    ? "border-orange-500"
                                    : "border-stone-300 dark:border-stone-700"
                                } bg-stone-100 dark:bg-stone-800 py-2 px-3 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                            placeholder="SEO description for search engines"
                            maxLength={160}
                        />
                        {freeCourseError.seoMetaDescription && (
                            <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                                <PiWarning size={16} /> {freeCourseError.seoMetaDescription}
                            </p>
                        )}
                        <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
                            {freeCourseData.seoMetaDescription?.length || 0}/160 characters
                        </p>
                    </div>
                </section>

                {/* Course Goals */}
                <section aria-labelledby="course-goals">
                    <h2
                        id="course-goals"
                        className="text-xl font-semibold text-orange-600 border-b border-orange-600 pb-2"
                    >
                        Course Goals
                    </h2>
                    <ArrayInput
                        label="Course Goals"
                        items={freeCourseData.courseGoals}
                        singleItem={singleCourseGoals}
                        setSingleItem={setSingleCourseGoals}
                        addItem={handleAddCourseGoal}
                        removeItem={handleRemoveCourseGoal}
                        placeholder="Add a course goal"
                        maxLength={500}
                    />
                    {freeCourseError.courseGoals && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                            <PiWarning size={16} /> {freeCourseError.courseGoals}
                        </p>
                    )}
                </section>

                {/* Syllabus Outline */}
                <section aria-labelledby="syllabus-outline">
                    <h2
                        id="syllabus-outline"
                        className="text-xl font-semibold text-orange-600 border-b border-orange-600 pb-2"
                    >
                        Syllabus Outline
                    </h2>
                    <ArrayInput
                        label="Syllabus Outline"
                        items={freeCourseData.syllabusOutline}
                        singleItem={singleSyllabusOutline}
                        setSingleItem={setSingleSyllabusOutline}
                        addItem={handleAddSyllabusOutline}
                        removeItem={handleRemoveSyllabusOutline}
                        placeholder="Add a syllabus item"
                        maxLength={500}
                    />
                    {freeCourseError.syllabusOutline && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                            <PiWarning size={16} /> {freeCourseError.syllabusOutline}
                        </p>
                    )}
                </section>

                {/* Target Audience */}
                <section aria-labelledby="target-audience">
                    <h2
                        id="target-audience"
                        className="text-xl font-semibold text-orange-600 border-b border-orange-600 pb-2"
                    >
                        Target Audience
                    </h2>
                    <ArrayInput
                        label="Target Audience"
                        items={freeCourseData.targetAudience}
                        singleItem={singleTargetAudience}
                        setSingleItem={setSingleTargetAudience}
                        addItem={handleAddTargetAudience}
                        removeItem={handleRemoveTargetAudience}
                        placeholder="Add a target audience"
                        maxLength={200}
                    />
                    {freeCourseError.targetAudience && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                            <PiWarning size={16} /> {freeCourseError.targetAudience}
                        </p>
                    )}
                </section>

                {/* Available Languages */}
                <section aria-labelledby="available-languages">
                    <h2
                        id="available-languages"
                        className="text-xl font-semibold text-orange-600 border-b border-orange-600 pb-2"
                    >
                        Available Languages
                    </h2>
                    <ArrayInput
                        label="Available Languages"
                        items={freeCourseData.availableLanguages}
                        singleItem={singleAvailableLanguage}
                        setSingleItem={setSingleAvailableLanguage}
                        addItem={handleAddAvailableLanguage}
                        removeItem={handleRemoveAvailableLanguage}
                        placeholder="Add a language (e.g., English)"
                        maxLength={50}
                    />
                    {freeCourseError.availableLanguages && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                            <PiWarning size={16} /> {freeCourseError.availableLanguages}
                        </p>
                    )}
                </section>

                {/* Course Category */}
                <section aria-labelledby="course-category">
                    <h2
                        id="course-category"
                        className="text-xl font-semibold text-orange-600 border-b border-orange-600 pb-2"
                    >
                        Course Category
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormInput
                            label="Category"
                            id="courseCategory"
                            name="courseCategory"
                            type="text"
                            value={freeCourseData.courseCategory}
                            onChange={handleCourseDetails}
                            error={freeCourseError.courseCategory}
                            placeholder="e.g., Web Development"
                            required
                            maxLength={100}
                        />

                        <FormInput
                            label="Sub-Category"
                            id="courseSubCategory"
                            name="courseSubCategory"
                            type="text"
                            value={freeCourseData.courseSubCategory}
                            onChange={handleCourseDetails}
                            error={freeCourseError.courseSubCategory}
                            placeholder="e.g., Frontend"
                            required
                            maxLength={100}
                        />
                    </div>
                </section>

                {/* Certificate */}
                <section aria-labelledby="certificate">
                    <h2
                        id="certificate"
                        className="text-xl font-semibold text-orange-600 border-b border-orange-600 pb-2"
                    >
                        Certificate
                    </h2>
                    <FormInput
                        label="Certificate Template URL"
                        id="certificateTemplateUrl"
                        name="certificateTemplateUrl"
                        type="url"
                        value={freeCourseData.certificateTemplateUrl}
                        onChange={handleCourseDetails}
                        error={freeCourseError.certificateTemplateUrl}
                        placeholder="https://example.com/certificate-template.jpg"
                    />
                </section>

                {/* Trending Score */}
                <section aria-labelledby="popularity">
                    <h2
                        id="popularity"
                        className="text-xl font-semibold text-orange-600 border-b border-orange-600 pb-2"
                    >
                        Popularity
                    </h2>
                    <FormInput
                        label="Trending Score"
                        id="trendingScore"
                        name="trendingScore"
                        type="number"
                        value={freeCourseData.trendingScore}
                        onChange={handleCourseDetails}
                        error={freeCourseError.trendingScore}
                        placeholder="0-100"
                        min={0}
                    />
                </section>

                {/* Instructor */}
                <section aria-labelledby="instructor">
                    <h2
                        id="instructor"
                        className="text-xl font-semibold text-orange-600 border-b border-orange-600 pb-2"
                    >
                        Instructor
                    </h2>
                    <div className="relative">
                        <div className="space-y-1">
                            <label htmlFor="courseInstructor" className="text-orange-600 font-bold">
                                Course Instructor
                                <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <PiUser />
                                </div>
                                <input
                                    id="courseInstructor"
                                    name="courseInstructor"
                                    type="text"
                                    value={instructorSearchField}
                                    onChange={(e) => setInstructorSearchField(e.target.value)}
                                    onFocus={handleInstructorFocus}
                                    onBlur={handleInstructorBlur}
                                    className={`w-full rounded-lg border ${freeCourseError.courseInstructor
                                            ? "border-red-500"
                                            : instructorSearchField
                                                ? "border-orange-500"
                                                : "border-stone-300 dark:border-stone-700"
                                        } bg-stone-100 dark:bg-stone-800 py-2 px-3 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent pl-10`}
                                    placeholder="Search for an instructor"
                                />
                            </div>
                            {freeCourseError.courseInstructor && (
                                <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                                    <PiWarning size={16} /> {freeCourseError.courseInstructor}
                                </p>
                            )}
                        </div>
                        {showInstructorDropdown && (
                            <div className="absolute z-10 w-full mt-1 bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                {isLoading ? (
                                    <div className="p-4 text-center text-stone-600 dark:text-stone-400">
                                        Loading instructors...
                                    </div>
                                ) : filteredInstructors.length === 0 ? (
                                    <div className="p-4 text-center text-stone-600 dark:text-stone-400">
                                        No instructors found
                                    </div>
                                ) : (
                                    filteredInstructors.map((instructor) => (
                                        <button
                                            key={instructor.id}
                                            type="button"
                                            onClick={() => handleInstructorSelect(instructor)}
                                            className="w-full flex items-center gap-2 p-3 hover:bg-orange-100 dark:hover:bg-stone-700 text-left"
                                            aria-label={`Select ${instructor.profile_details.fullName}`}
                                        >
                                            <img
                                                src={instructor.profile_details.avatarUrl}
                                                alt={`${instructor.profile_details.fullName}'s avatar`}
                                                className="w-8 h-8 rounded-full"
                                                onError={(e) => {
                                                    e.currentTarget.src = "/default-avatar.png";
                                                }}
                                            />
                                            <span className="text-stone-900 dark:text-stone-100">
                                                {instructor.profile_details.fullName}
                                            </span>
                                        </button>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                </section>

                {/* Modules Section */}
                <section aria-labelledby="course-modules">
                    <h2
                        id="course-modules"
                        className="text-xl font-semibold text-orange-600 border-b border-orange-600 pb-2"
                    >
                        Course Modules
                    </h2>
                    {freeCourseError.modules && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                            <PiWarning size={16} /> {freeCourseError.modules}
                        </p>
                    )}
                    {freeCourseData.modules.length > 0 && (
                        <div className="space-y-3">
                            {freeCourseData.modules.map((module: FreeCourseModule, index: number) => (
                                <div
                                    key={index}
                                    className="bg-stone-100 dark:bg-stone-800 p-4 rounded-lg"
                                >
                                    <div className="flex justify-between items-center">
                                        <h3 className="font-semibold text-lg">
                                            {module.order}. {module.moduleTitle}
                                        </h3>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveModule(index)}
                                            className="text-red-500 hover:text-red-700"
                                            aria-label={`Remove module ${module.moduleTitle}`}
                                        >
                                            <PiTrash />
                                        </button>
                                    </div>
                                    <p className="text-stone-600 dark:text-stone-400 mt-1">
                                        Duration: {module.moduleDurationInDays} days
                                    </p>
                                    {module.moduleDescription && (
                                        <p className="mt-2">{module.moduleDescription}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    <button
                        type="button"
                        onClick={() => setShowModuleForm(true)}
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2"
                    >
                        <PiPlus /> Add Module
                    </button>
                </section>

                {showModuleForm && (
                    <ModuleForm
                        singleModule={singleModule}
                        singleModuleError={singleModuleError}
                        setSingleModule={setSingleModule}
                        setSingleModuleError={setSingleModuleError}
                        handleAddModule={handleAddModule}
                        resetModuleForm={resetModuleForm}
                        singleNotes={singleNotes}
                        setSingleNotes={setSingleNotes}
                        singleArticleUrl={singleArticleUrl}
                        setSingleArticleUrl={setSingleArticleUrl}
                        singleLearningObjectives={singleLearningObjectives}
                        setSingleLearningObjectives={setSingleLearningObjectives}
                        handleAddNotesUrl={handleAddNotesUrl}
                        handleRemoveNotesUrl={handleRemoveNotesUrl}
                        handleAddArticleUrl={handleAddArticleUrl}
                        handleRemoveArticleUrl={handleRemoveArticleUrl}
                        handleAddLearningObjective={handleAddLearningObjective}
                        handleRemoveLearningObjective={handleRemoveLearningObjective}
                    />
                )}

                <div className="pt-6">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`w-full py-3 px-6 rounded-lg font-bold text-lg ${isSubmitting
                            ? "bg-orange-300 cursor-not-allowed"
                            : "bg-orange-500 hover:bg-orange-600"
                            } text-white`}
                    >
                        {isSubmitting ? "Creating Course..." : "Create Course"}
                    </button>
                </div>
            </form>
        </div>
    );
}