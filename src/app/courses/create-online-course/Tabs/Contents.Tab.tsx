import React, { useCallback, useMemo } from "react";
import {
  PiBook,
  PiClock,
  PiImage,
  PiLink,
  PiListBullets,
  PiPlus,
  PiTrash,
  PiWarning,
} from "react-icons/pi";

// Define interfaces
interface Course_Modules {
  moduleTitle: string;
  moduleDescription: string;
  moduleDurationInDays: number;
  moduleBannerUrl: string;
  moduleLearningObjectives: string[];
  notesUrl:string;
  articleUrl:string
  order: number;
}

interface Course_Module_Error {
  moduleBannerUrl: string;
  moduleDescription: string;
  moduleDurationInDays: string;
  moduleLearningObjectives: string;
  moduleTitle: string;
  notesUrl:string;
  articleUrl:string
  order: string;
}

interface ModuleTabProps {
  modules: Course_Modules[];
  singleCourseModule: Course_Modules;
  singleCourseModuleError: Course_Module_Error;
  learningObjective: string;
  onModuleFieldChange: (name: keyof Course_Modules, value: any) => void;
  onLearningObjectiveChange: (value: string) => void;
  onAddLearningObjective: (objective: string) => void;
  onRemoveLearningObjective: (index: number) => void;
  onAddModule: (module: Course_Modules) => void;
  onRemoveModule: (index: number) => void;
}

export function ModuleTab({
  modules,
  singleCourseModule,
  singleCourseModuleError,
  learningObjective,
  onModuleFieldChange,
  onLearningObjectiveChange,
  onAddLearningObjective,
  onRemoveLearningObjective,
  onAddModule,
  onRemoveModule,
}: ModuleTabProps) {
  // Handlers for adding items
  const handleAddLearningObjective = useCallback(() => {
    const trimmed = learningObjective.trim();
    if (trimmed) {
      onAddLearningObjective(trimmed);
    }
  }, [learningObjective, onAddLearningObjective]);

  const handleAddModule = useCallback(() => {
    onAddModule(singleCourseModule);
  }, [singleCourseModule, onAddModule]);

  const CourseModulesTab = useMemo(
    () => (
      <div className="w-[64rem] space-y-6">
        <h1 className="text-4xl font-bold text-orange-600 text-shadow-xl">
          Course Modules
        </h1>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-1">
              <label htmlFor="moduleTitle" className="text-orange-600 font-bold">
                Module Title
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <PiBook className="h-5 w-5 text-stone-400" />
                </div>
                <input
                  id="moduleTitle"
                  name="moduleTitle"
                  type="text"
                  value={singleCourseModule.moduleTitle}
                  onChange={(e) => onModuleFieldChange("moduleTitle", e.target.value)}
                  className={`pl-10 outline-none w-full rounded-lg border ${
                    singleCourseModuleError.moduleTitle
                      ? "border-red-500"
                      : singleCourseModule.moduleTitle
                      ? "border-orange-500"
                      : "border-stone-300 dark:border-stone-700"
                  } bg-stone-100 dark:bg-stone-800 py-2 px-3 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                  placeholder="e.g., Introduction to JavaScript"
                  maxLength={100}
                  aria-invalid={!!singleCourseModuleError.moduleTitle}
                  aria-describedby="moduleTitle-error"
                />
              </div>
              <div aria-live="polite">
                {singleCourseModuleError.moduleTitle && (
                  <p
                    id="moduleTitle-error"
                    className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
                  >
                    <PiWarning size={16} /> {singleCourseModuleError.moduleTitle}
                  </p>
                )}
              </div>
            </div>
            <div className="space-y-1">
              <label
                htmlFor="moduleDurationInDays"
                className="text-orange-600 font-bold"
              >
                Duration (Days)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <PiClock className="h-5 w-5 text-stone-400" />
                </div>
                <input
                  id="moduleDurationInDays"
                  name="moduleDurationInDays"
                  type="number"
                  min="1"
                  value={singleCourseModule.moduleDurationInDays || ""}
                  onChange={(e) =>
                    onModuleFieldChange("moduleDurationInDays", e.target.value)
                  }
                  className={`pl-10 outline-none w-full rounded-lg border ${
                    singleCourseModuleError.moduleDurationInDays
                      ? "border-red-500"
                      : singleCourseModule.moduleDurationInDays
                      ? "border-orange-500"
                      : "border-stone-300 dark:border-stone-700"
                  } bg-stone-100 dark:bg-stone-800 py-2 px-3 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                  placeholder="e.g., 5"
                  aria-invalid={!!singleCourseModuleError.moduleDurationInDays}
                  aria-describedby="moduleDurationInDays-error"
                />
              </div>
              <div aria-live="polite">
                {singleCourseModuleError.moduleDurationInDays && (
                  <p
                    id="moduleDurationInDays-error"
                    className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
                  >
                    <PiWarning size={16} />{" "}
                    {singleCourseModuleError.moduleDurationInDays}
                  </p>
                )}
              </div>
            </div>
            <div className="space-y-1">
              <label htmlFor="moduleBannerUrl" className="text-orange-600 font-bold">
                Module Banner URL
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <PiImage className="h-5 w-5 text-stone-400" />
                </div>
                <input
                  id="moduleBannerUrl"
                  name="moduleBannerUrl"
                  type="text"
                  value={singleCourseModule.moduleBannerUrl}
                  onChange={(e) =>
                    onModuleFieldChange("moduleBannerUrl", e.target.value)
                  }
                  className={`pl-10 outline-none w-full rounded-lg border ${
                    singleCourseModuleError.moduleBannerUrl
                      ? "border-red-500"
                      : singleCourseModule.moduleBannerUrl
                      ? "border-orange-500"
                      : "border-stone-300 dark:border-stone-700"
                  } bg-stone-100 dark:bg-stone-800 py-2 px-3 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                  placeholder="e.g., https://example.com/banner.jpg"
                  maxLength={1000}
                  aria-invalid={!!singleCourseModuleError.moduleBannerUrl}
                  aria-describedby="moduleBannerUrl-error"
                />
              </div>
              <div aria-live="polite">
                {singleCourseModuleError.moduleBannerUrl && (
                  <p
                    id="moduleBannerUrl-error"
                    className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
                  >
                    <PiWarning size={16} /> {singleCourseModuleError.moduleBannerUrl}
                  </p>
                )}
              </div>
            </div>
            <div className="space-y-1">
              <label htmlFor="order" className="text-orange-600 font-bold">
                Module Order
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <PiListBullets className="h-5 w-5 text-stone-400" />
                </div>
                <input
                  id="order"
                  name="order"
                  type="number"
                  min="0"
                  value={singleCourseModule.order || ""}
                  onChange={(e) => onModuleFieldChange("order", e.target.value)}
                  className={`pl-10 outline-none w-full rounded-lg border ${
                    singleCourseModuleError.order
                      ? "border-red-500"
                      : singleCourseModule.order
                      ? "border-orange-500"
                      : "border-stone-300 dark:border-stone-700"
                  } bg-stone-100 dark:bg-stone-800 py-2 px-3 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                  placeholder="e.g., 1"
                  aria-invalid={!!singleCourseModuleError.order}
                  aria-describedby="order-error"
                />
              </div>
              <div aria-live="polite">
                {singleCourseModuleError.order && (
                  <p
                    id="order-error"
                    className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
                  >
                    <PiWarning size={16} /> {singleCourseModuleError.order}
                  </p>
                )}
              </div>
            </div>
            <div className="space-y-1">
              <label htmlFor="articleUrl" className="text-orange-600 font-bold">
                Module Article Url
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <PiLink className="h-5 w-5 text-stone-400" />
                </div>
                <input
                  id="articleUrl"
                  name="articleUrl"
                  type="text"
                  value={singleCourseModule.articleUrl || ""}
                  onChange={(e) => onModuleFieldChange("articleUrl", e.target.value)}
                  className={`pl-10 outline-none w-full rounded-lg border ${
                    singleCourseModuleError.articleUrl
                      ? "border-red-500"
                      : singleCourseModule.articleUrl
                      ? "border-orange-500"
                      : "border-stone-300 dark:border-stone-700"
                  } bg-stone-100 dark:bg-stone-800 py-2 px-3 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                  placeholder="e.g., 1"
                  aria-invalid={!!singleCourseModuleError.articleUrl}
                  aria-describedby="articleUrl-error"
                />
              </div>
              <div aria-live="polite">
                {singleCourseModuleError.articleUrl && (
                  <p
                    id="articleUrl-error"
                    className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
                  >
                    <PiWarning size={16} /> {singleCourseModuleError.articleUrl}
                  </p>
                )}
              </div>
            </div>
            <div className="space-y-1">
              <label htmlFor="notesUrl" className="text-orange-600 font-bold">
                Module Notes Url
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <PiLink className="h-5 w-5 text-stone-400" />
                </div>
                <input
                  id="notesUrl"
                  name="notesUrl"
                  type="text"
                  value={singleCourseModule.notesUrl || ""}
                  onChange={(e) => onModuleFieldChange("notesUrl", e.target.value)}
                  className={`pl-10 outline-none w-full rounded-lg border ${
                    singleCourseModuleError.notesUrl
                      ? "border-red-500"
                      : singleCourseModule.notesUrl
                      ? "border-orange-500"
                      : "border-stone-300 dark:border-stone-700"
                  } bg-stone-100 dark:bg-stone-800 py-2 px-3 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                  placeholder="e.g., 1"
                  aria-invalid={!!singleCourseModuleError.notesUrl}
                  aria-describedby="notesUrl-error"
                />
              </div>
              <div aria-live="polite">
                {singleCourseModuleError.notesUrl && (
                  <p
                    id="notesUrl-error"
                    className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
                  >
                    <PiWarning size={16} /> {singleCourseModuleError.notesUrl}
                  </p>
                )}
              </div>
            </div>
          </div>
          <div className="space-y-1">
            <label
              htmlFor="moduleDescription"
              className="text-orange-600 font-bold"
            >
              Module Description
            </label>
            <textarea
              id="moduleDescription"
              name="moduleDescription"
              value={singleCourseModule.moduleDescription}
              onChange={(e) =>
                onModuleFieldChange("moduleDescription", e.target.value)
              }
              className={`w-full rounded-lg border ${
                singleCourseModuleError.moduleDescription
                  ? "border-red-500"
                  : singleCourseModule.moduleDescription
                  ? "border-orange-500"
                  : "border-stone-300 dark:border-stone-700"
              } bg-stone-100 dark:bg-stone-800 py-2 px-3 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent min-h-[100px]`}
              placeholder="Describe the module content"
              maxLength={1000}
              aria-invalid={!!singleCourseModuleError.moduleDescription}
              aria-describedby="moduleDescription-error"
            />
            <div aria-live="polite">
              {singleCourseModuleError.moduleDescription && (
                <p
                  id="moduleDescription-error"
                  className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
                >
                  <PiWarning size={16} />{" "}
                  {singleCourseModuleError.moduleDescription}
                </p>
              )}
            </div>
            <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
              {singleCourseModule.moduleDescription.length}/1000 characters
            </p>
          </div>
          <div className="space-y-1">
            <label
              htmlFor="moduleLearningObjectives"
              className="text-orange-600 font-bold"
            >
              Learning Objectives
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <PiListBullets className="h-5 w-5 text-stone-400" />
              </div>
              <div className="flex items-center gap-2">
                <input
                  id="moduleLearningObjectives"
                  name="moduleLearningObjectives"
                  type="text"
                  value={learningObjective}
                  onChange={(e) => onLearningObjectiveChange(e.target.value)}
                  className={`pl-10 outline-none w-full rounded-lg border ${
                    singleCourseModuleError.moduleLearningObjectives
                      ? "border-red-500"
                      : learningObjective
                      ? "border-orange-500"
                      : "border-stone-300 dark:border-stone-700"
                  } bg-stone-100 dark:bg-stone-800 py-2 px-3 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                  placeholder="e.g., Understand JavaScript basics"
                  maxLength={100}
                  aria-invalid={!!singleCourseModuleError.moduleLearningObjectives}
                  aria-describedby="moduleLearningObjectives-error"
                />
                <button
                  onClick={handleAddLearningObjective}
                  className="p-2 h-10 w-10 rounded flex items-center justify-center cursor-pointer bg-orange-600 text-stone-100 dark:text-stone-900"
                  aria-label="Add learning objective"
                >
                  <PiPlus />
                </button>
              </div>
            </div>
            <div aria-live="polite">
              {singleCourseModuleError.moduleLearningObjectives && (
                <p
                  id="moduleLearningObjectives-error"
                  className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
                >
                  <PiWarning size={16} />{" "}
                  {singleCourseModuleError.moduleLearningObjectives}
                </p>
              )}
            </div>
            <div className="flex mt-4 gap-4 flex-wrap">
              {singleCourseModule.moduleLearningObjectives.map((objective, index) => (
                <span
                  key={index}
                  className="flex gap-2 px-3 py-1 text-orange-600 rounded text-lg font-bold bg-stone-100/50"
                >
                  <p>{objective}</p>
                  <button
                    onClick={() => onRemoveLearningObjective(index)}
                    className="cursor-pointer"
                    aria-label={`Remove ${objective}`}
                  >
                    <PiTrash />
                  </button>
                </span>
              ))}
            </div>
          </div>
          <button
          type="button"
            onClick={handleAddModule}
            className="flex rounded items-center gap-4 px-4 font-bold py-2 bg-orange-600 text-stone-100 dark:text-stone-900"
          >
            <PiPlus /> Add Module
          </button>
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-orange-600 font-bold">Added Modules:</span>
          <ul className="space-y-2">
            {modules.map((module, index) => (
              <li
                key={index}
                className="w-full text-orange-600 rounded flex items-center justify-between p-2 bg-stone-100/50 shadow-sm shadow-stone-500"
              >
                <div>
                  <p>
                    <strong>{module.moduleTitle}</strong> (Order: {module.order})
                  </p>
                  <p>{module.moduleDescription.substring(0, 50)}...</p>
                </div>
                <button
                type="button"
                  onClick={() => onRemoveModule(index)}
                  aria-label={`Remove ${module.moduleTitle}`}
                >
                  <PiTrash />
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    ),
    [
      singleCourseModule,
      singleCourseModuleError,
      learningObjective,
      modules,
      onModuleFieldChange,
      onLearningObjectiveChange,
      handleAddLearningObjective,
      onRemoveLearningObjective,
      handleAddModule,
      onRemoveModule,
    ]
  );

  return CourseModulesTab;
}