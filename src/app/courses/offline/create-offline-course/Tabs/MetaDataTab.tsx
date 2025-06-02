import React, { useState } from 'react';
import { PiTag, PiGlobe, PiUsers, PiTrendUp, PiPlus, PiTrash, PiWarning } from 'react-icons/pi';

interface MetadataErrors {
    courseType: string;
    courseCategories: string;
    courseSubCategories: string;
    targetAudience: string;
    availableLanguages: string;
    tags: string;
}
interface ICourseMetadata {
    courseType: CourseType;
    courseCategories?: string[];
    courseSubCategories?: string[];
    targetAudience: string[];
    availableLanguages: string[];
    tags: string[];
    trendingScore: number;
    lastTrendingUpdate: Date;
}
export enum CourseType {
    ONLINE = 'online',
    OFFLINE = 'offline',
    FREE = 'free'
}

interface MetadataTabProps {
    metadata: ICourseMetadata;
    onMetadataChange: (name: keyof ICourseMetadata, value: any) => void;
    errors: MetadataErrors;
    courseType: CourseType;
}

const languageOptions = ['English', 'Spanish', 'French', 'German', 'Chinese', 'Hindi', 'Arabic'];
const categoryOptions = ['Technology', 'Business', 'Design', 'Marketing', 'Health', 'Language', 'Science'];
const subCategoryOptions: Record<string, string[]> = {
    Technology: ['Programming', 'Web Development', 'Data Science', 'Mobile Development', 'Cybersecurity'],
    Business: ['Finance', 'Entrepreneurship', 'Management', 'Leadership', 'Real Estate'],
    Design: ['Graphic Design', 'UI/UX', '3D Modeling', 'Photography', 'Fashion Design'],
    Marketing: ['Digital Marketing', 'Social Media', 'Content Marketing', 'SEO', 'Branding'],
    Health: ['Fitness', 'Nutrition', 'Mental Health', 'Yoga', 'Medical'],
    Language: ['English', 'Spanish', 'French', 'German', 'Japanese'],
    Science: ['Physics', 'Chemistry', 'Biology', 'Astronomy', 'Mathematics']
};

const MetadataTab: React.FC<MetadataTabProps> = ({
    metadata,
    onMetadataChange,
    errors,
    courseType
}) => {
    const [singleCategory, setSingleCategory] = useState('');
    const [singleSubCategory, setSingleSubCategory] = useState('');
    const [singleTargetAudience, setSingleTargetAudience] = useState('');
    const [singleTag, setSingleTag] = useState('');

    const handleAddCategory = () => {
        if (singleCategory.trim() && !metadata.courseCategories?.includes(singleCategory.trim())) {
            const updatedCategories = [...(metadata.courseCategories || []), singleCategory.trim()];
            onMetadataChange('courseCategories', updatedCategories);
            setSingleCategory('');
        }
    };

    const handleRemoveCategory = (index: number) => {
        const updatedCategories = [...(metadata.courseCategories || [])];
        updatedCategories.splice(index, 1);
        onMetadataChange('courseCategories', updatedCategories);
    };

    const handleAddSubCategory = () => {
        if (singleSubCategory.trim() && !metadata.courseSubCategories?.includes(singleSubCategory.trim())) {
            const updatedSubCategories = [...(metadata.courseSubCategories || []), singleSubCategory.trim()];
            onMetadataChange('courseSubCategories', updatedSubCategories);
            setSingleSubCategory('');
        }
    };

    const handleRemoveSubCategory = (index: number) => {
        const updatedSubCategories = [...(metadata.courseSubCategories || [])];
        updatedSubCategories.splice(index, 1);
        onMetadataChange('courseSubCategories', updatedSubCategories);
    };

    const handleAddTargetAudience = () => {
        if (singleTargetAudience.trim() && !metadata.targetAudience.includes(singleTargetAudience.trim())) {
            const updatedAudience = [...metadata.targetAudience, singleTargetAudience.trim()];
            onMetadataChange('targetAudience', updatedAudience);
            setSingleTargetAudience('');
        }
    };

    const handleRemoveTargetAudience = (index: number) => {
        const updatedAudience = [...metadata.targetAudience];
        updatedAudience.splice(index, 1);
        onMetadataChange('targetAudience', updatedAudience);
    };

    const handleAddTag = () => {
        if (singleTag.trim() && !metadata.tags.includes(singleTag.trim())) {
            const updatedTags = [...metadata.tags, singleTag.trim()];
            onMetadataChange('tags', updatedTags);
            setSingleTag('');
        }
    };

    const handleRemoveTag = (index: number) => {
        const updatedTags = [...metadata.tags];
        updatedTags.splice(index, 1);
        onMetadataChange('tags', updatedTags);
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
                Course Metadata
            </h1>

            <div className="grid grid-cols-2 gap-6">
                {/* Course Type (Display Only) */}
                <div className="space-y-1">
                    <label className="text-orange-600 font-bold">
                        Course Type
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <PiTag className="h-5 w-5 text-stone-400" />
                        </div>
                        <input
                            type="text"
                            value={courseType.charAt(0).toUpperCase() + courseType.slice(1)}
                            readOnly
                            className="pl-10 outline-none w-full rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-100 dark:bg-stone-800 py-2 px-3 text-stone-900 dark:text-stone-100"
                        />
                    </div>
                </div>

                {/* Available Languages */}
                <div className="space-y-1">
                    <label htmlFor="availableLanguages" className="text-orange-600 font-bold">
                        Available Languages
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <PiGlobe className="h-5 w-5 text-stone-400" />
                        </div>
                        <select
                            id="availableLanguages"
                            name="availableLanguages"
                            multiple
                            value={metadata.availableLanguages}
                            onChange={(e) => {
                                const selected = Array.from(e.target.selectedOptions, option => option.value);
                                onMetadataChange('availableLanguages', selected);
                            }}
                            className={`pl-10 outline-none w-full rounded-lg border ${errors.availableLanguages
                                ? "border-red-500"
                                : metadata.availableLanguages.length
                                    ? "border-orange-500"
                                    : "border-stone-300 dark:border-stone-700"
                                } bg-stone-100 dark:bg-stone-800 py-2 px-3 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                            aria-invalid={!!errors.availableLanguages}
                            aria-describedby="availableLanguages-error"
                        >
                            {languageOptions.map((language) => (
                                <option key={language} value={language}>
                                    {language}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div aria-live="polite">
                        {errors.availableLanguages && (
                            <p id="availableLanguages-error" className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                                <PiWarning size={16} /> {errors.availableLanguages}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Categories */}
            <div className="space-y-1">
                <label htmlFor="courseCategories" className="text-orange-600 font-bold">
                    Course Categories
                </label>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <PiTag className="h-5 w-5 text-stone-400" />
                            </div>
                            <select
                                value={singleCategory}
                                onChange={(e) => setSingleCategory(e.target.value)}
                                className="pl-10 outline-none w-full rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-100 dark:bg-stone-800 py-2 px-3 text-stone-900 dark:text-stone-100"
                            >
                                <option value="">Select a category</option>
                                {categoryOptions.map((category) => (
                                    <option key={category} value={category}>
                                        {category}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <button
                            type="button"
                            onClick={handleAddCategory}
                            className="w-full py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-500"
                        >
                            Add Category
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {metadata.courseCategories?.map((category: string, index: number) => (
                            <span
                                key={index}
                                className="flex items-center gap-2 px-3 py-1 bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 rounded-full"
                            >
                                {category}
                                <button
                                    type="button"
                                    onClick={() => handleRemoveCategory(index)}
                                    className="text-orange-600 dark:text-orange-300 hover:text-red-600"
                                    aria-label={`Remove ${category}`}
                                >
                                    <PiTrash size={16} />
                                </button>
                            </span>
                        ))}
                    </div>
                </div>
                <div aria-live="polite">
                    {errors.courseCategories && (
                        <p id="courseCategories-error" className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                            <PiWarning size={16} /> {errors.courseCategories}
                        </p>
                    )}
                </div>
            </div>

            {/* Sub-Categories */}
            {metadata.courseCategories?.length ? (
                <div className="space-y-1">
                    <label htmlFor="courseSubCategories" className="text-orange-600 font-bold">
                        Course Sub-Categories
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <PiTag className="h-5 w-5 text-stone-400" />
                                </div>
                                <select
                                    value={singleSubCategory}
                                    onChange={(e) => setSingleSubCategory(e.target.value)}
                                    className="pl-10 outline-none w-full rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-100 dark:bg-stone-800 py-2 px-3 text-stone-900 dark:text-stone-100"
                                >
                                    <option value="">Select a sub-category</option>
                                    {metadata.courseCategories.flatMap((category: string) =>
                                        subCategoryOptions[category]?.map(subCategory => (
                                            <option key={`${category}-${subCategory}`} value={subCategory}>
                                                {subCategory}
                                            </option>
                                        )) || []
                                    )}
                                </select>
                            </div>
                            <button
                                type="button"
                                onClick={handleAddSubCategory}
                                className="w-full py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-500"
                            >
                                Add Sub-Category
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {metadata.courseSubCategories?.map((subCategory: string, index: number) => (
                                <span
                                    key={index}
                                    className="flex items-center gap-2 px-3 py-1 bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 rounded-full"
                                >
                                    {subCategory}
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveSubCategory(index)}
                                        className="text-orange-600 dark:text-orange-300 hover:text-red-600"
                                        aria-label={`Remove ${subCategory}`}
                                    >
                                        <PiTrash size={16} />
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>
                    <div aria-live="polite">
                        {errors.courseSubCategories && (
                            <p id="courseSubCategories-error" className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                                <PiWarning size={16} /> {errors.courseSubCategories}
                            </p>
                        )}
                    </div>
                </div>
            ) : null}

            {/* Target Audience */}
            <div className="space-y-1">
                <label htmlFor="targetAudience" className="text-orange-600 font-bold">
                    Target Audience
                </label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <PiUsers className="h-5 w-5 text-stone-400" />
                    </div>
                    <div className="flex items-center gap-2">
                        <input
                            id="targetAudience"
                            name="targetAudience"
                            type="text"
                            value={singleTargetAudience}
                            onChange={(e) => setSingleTargetAudience(e.target.value)}
                            onKeyDown={(e) => handleInputKeyDown(
                                e,
                                singleTargetAudience,
                                handleAddTargetAudience,
                                () => setSingleTargetAudience('')
                            )}
                            className={`pl-10 outline-none w-full rounded-lg border ${errors.targetAudience
                                ? "border-red-500"
                                : singleTargetAudience
                                    ? "border-orange-500"
                                    : "border-stone-300 dark:border-stone-700"
                                } bg-stone-100 dark:bg-stone-800 py-2 px-3 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                            placeholder="e.g., Beginners, Professionals, Students"
                            maxLength={100}
                            aria-invalid={!!errors.targetAudience}
                            aria-describedby="targetAudience-error"
                        />
                        <button
                            type="button"
                            onClick={handleAddTargetAudience}
                            className="p-2 h-10 w-10 rounded flex items-center justify-center cursor-pointer bg-orange-600 text-stone-100 dark:text-stone-900 hover:bg-orange-500"
                            aria-label="Add target audience"
                        >
                            <PiPlus />
                        </button>
                    </div>
                </div>
                <div aria-live="polite">
                    {errors.targetAudience && (
                        <p id="targetAudience-error" className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                            <PiWarning size={16} /> {errors.targetAudience}
                        </p>
                    )}
                </div>
                <div className="flex mt-4 gap-2 flex-wrap">
                    {metadata.targetAudience.map((audience: string, index: number) => (
                        <span
                            key={index}
                            className="flex items-center gap-2 px-3 py-1 bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 rounded-full"
                        >
                            {audience}
                            <button
                                type="button"
                                onClick={() => handleRemoveTargetAudience(index)}
                                className="text-orange-600 dark:text-orange-300 hover:text-red-600"
                                aria-label={`Remove ${audience}`}
                            >
                                <PiTrash size={16} />
                            </button>
                        </span>
                    ))}
                </div>
            </div>

            {/* Tags */}
            <div className="space-y-1">
                <label htmlFor="tags" className="text-orange-600 font-bold">
                    Tags
                </label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <PiTag className="h-5 w-5 text-stone-400" />
                    </div>
                    <div className="flex items-center gap-2">
                        <input
                            id="tags"
                            name="tags"
                            type="text"
                            value={singleTag}
                            onChange={(e) => setSingleTag(e.target.value)}
                            onKeyDown={(e) => handleInputKeyDown(
                                e,
                                singleTag,
                                handleAddTag,
                                () => setSingleTag('')
                            )}
                            className={`pl-10 outline-none w-full rounded-lg border ${errors.tags
                                ? "border-red-500"
                                : singleTag
                                    ? "border-orange-500"
                                    : "border-stone-300 dark:border-stone-700"
                                } bg-stone-100 dark:bg-stone-800 py-2 px-3 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                            placeholder="e.g., javascript, web-development"
                            maxLength={50}
                            aria-invalid={!!errors.tags}
                            aria-describedby="tags-error"
                        />
                        <button
                            type="button"
                            onClick={handleAddTag}
                            className="p-2 h-10 w-10 rounded flex items-center justify-center cursor-pointer bg-orange-600 text-stone-100 dark:text-stone-900 hover:bg-orange-500"
                            aria-label="Add tag"
                        >
                            <PiPlus />
                        </button>
                    </div>
                </div>
                <div aria-live="polite">
                    {errors.tags && (
                        <p id="tags-error" className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                            <PiWarning size={16} /> {errors.tags}
                        </p>
                    )}
                </div>
                <div className="flex mt-4 gap-2 flex-wrap">
                    {metadata.tags.map((tag: string, index: number) => (
                        <span
                            key={index}
                            className="flex items-center gap-2 px-3 py-1 bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 rounded-full"
                        >
                            {tag}
                            <button
                                type="button"
                                onClick={() => handleRemoveTag(index)}
                                className="text-orange-600 dark:text-orange-300 hover:text-red-600"
                                aria-label={`Remove ${tag}`}
                            >
                                <PiTrash size={16} />
                            </button>
                        </span>
                    ))}
                </div>
            </div>

            {/* Trending Score (Display Only) */}
            <div className="space-y-1">
                <label className="text-orange-600 font-bold">
                    Trending Score
                </label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <PiTrendUp className="h-5 w-5 text-stone-400" />
                    </div>
                    <input
                        type="text"
                        value={metadata.trendingScore}
                        readOnly
                        className="pl-10 outline-none w-full rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-100 dark:bg-stone-800 py-2 px-3 text-stone-900 dark:text-stone-100"
                    />
                </div>
                <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
                    Last updated: {metadata.lastTrendingUpdate.toLocaleDateString()}
                </p>
            </div>
        </div>
    );
};

export default MetadataTab;