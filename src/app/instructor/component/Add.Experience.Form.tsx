"use client";
import { I_Experiences } from "@/models/experience.model";
import { useState, FormEvent } from "react";
import { PiBuilding, PiCalendar, PiNote, PiUser } from "react-icons/pi";

interface AddExperienceFormProps {
  handleAddExperience: (data: I_Experiences) => void;
}

export default function AddExperienceForm({ 
  handleAddExperience 
}: AddExperienceFormProps): React.ReactElement {
  const [experience, setExperience] = useState<Partial<I_Experiences>>({
    workedOrganization: "",
    workDurationInMonths: 0,
    organizationJoiningDate: new Date(),
    organizationLeaveDate: new Date(),
    role: "",
    workDescription: "",
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    handleAddExperience(experience);
  };

  const handleChange = <K extends keyof I_Experiences>(
    field: K,
    value: I_Experiences[K]
  ) => {
    setExperience(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Proper date handling functions
  const handleDateChange = (field: 'organizationJoiningDate' | 'organizationLeaveDate', dateString: string) => {
    const date = dateString ? new Date(dateString) : new Date();
    if (!isNaN(date.getTime())) {
      handleChange(field, date);
      calculateDuration();
    }
  };

  const formatDateForInput = (date: Date) => {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      return new Date().toISOString().split('T')[0];
    }
    return date.toISOString().split('T')[0];
  };

  const calculateDuration = () => {
    if (experience.organizationJoiningDate && experience.organizationLeaveDate) {
      const joinDate = new Date(experience.organizationJoiningDate);
      const leaveDate = new Date(experience.organizationLeaveDate);
      
      // Ensure leave date is after join date
      if (leaveDate >= joinDate) {
        const diffInMonths = 
          (leaveDate.getFullYear() - joinDate.getFullYear()) * 12 + 
          (leaveDate.getMonth() - joinDate.getMonth());
        handleChange("workDurationInMonths", Math.max(0, diffInMonths));
      } else {
        // Reset duration if dates are invalid
        handleChange("workDurationInMonths", 0);
      }
    }
  };

  const resetForm = () => {
    setExperience({
      workedOrganization: "",
      workDurationInMonths: 0,
      organizationJoiningDate: new Date(),
      organizationLeaveDate: new Date(),
      role: "",
      workDescription: "",
    });
  };

  // Validate if leave date is after join date
  const isDateValid = experience.organizationLeaveDate >= experience.organizationJoiningDate;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-stone-50 dark:bg-stone-900 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-orange-600 dark:text-orange-500 mb-6 flex items-center gap-2">
        <PiBuilding size={24} />
        Add Work Experience
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Worked Organization */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300">
              Organization Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <PiBuilding className="h-5 w-5 text-stone-400" />
              </div>
              <input
                type="text"
                required
                value={experience.workedOrganization}
                onChange={(e) => handleChange("workedOrganization", e.target.value)}
                className="pl-10 w-full rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-100 dark:bg-stone-800 py-2 px-3 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Enter organization name"
              />
            </div>
          </div>

          {/* Role */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300">
              Role/Position
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <PiUser className="h-5 w-5 text-stone-400" />
              </div>
              <input
                type="text"
                required
                value={experience.role}
                onChange={(e) => handleChange("role", e.target.value)}
                className="pl-10 w-full rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-100 dark:bg-stone-800 py-2 px-3 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Enter your role"
              />
            </div>
          </div>

          {/* Joining Date */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300">
              Joining Date
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <PiCalendar className="h-5 w-5 text-stone-400" />
              </div>
              <input
                type="date"
                required
                value={formatDateForInput(experience.organizationJoiningDate)}
                onChange={(e) => handleDateChange('organizationJoiningDate', e.target.value)}
                className="pl-10 w-full rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-100 dark:bg-stone-800 py-2 px-3 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                max={formatDateForInput(experience.organizationLeaveDate)}
              />
            </div>
          </div>

          {/* Leave Date */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300">
              Leave Date
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <PiCalendar className="h-5 w-5 text-stone-400" />
              </div>
              <input
                type="date"
                required
                value={formatDateForInput(experience.organizationLeaveDate)}
                onChange={(e) => handleDateChange('organizationLeaveDate', e.target.value)}
                className={`pl-10 w-full rounded-lg border ${isDateValid ? 'border-stone-300 dark:border-stone-700' : 'border-red-500'} bg-stone-100 dark:bg-stone-800 py-2 px-3 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                min={formatDateForInput(experience.organizationJoiningDate)}
              />
              {!isDateValid && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  Leave date must be after joining date
                </p>
              )}
            </div>
          </div>

          {/* Duration (auto-calculated) */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300">
              Duration (Months)
            </label>
            <div className="relative">
              <input
                type="number"
                readOnly
                value={isDateValid ? experience.workDurationInMonths : 0}
                className="w-full rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-200 dark:bg-stone-700 py-2 px-3 text-stone-900 dark:text-stone-100 cursor-not-allowed"
              />
            </div>
          </div>

          {/* Work Description */}
          <div className="md:col-span-2 space-y-1">
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300">
              Work Description
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 pt-3 flex items-start pointer-events-none">
                <PiNote className="h-5 w-5 text-stone-400" />
              </div>
              <textarea
                value={experience.workDescription}
                onChange={(e) => handleChange("workDescription", e.target.value)}
                className="pl-10 w-full rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-100 dark:bg-stone-800 py-2 px-3 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent min-h-[100px]"
                placeholder="Describe your responsibilities and achievements"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-4">
          <button
            type="button"
            onClick={resetForm}
            className="px-4 py-2 rounded-lg bg-stone-200 dark:bg-stone-700 text-stone-800 dark:text-stone-200 hover:bg-stone-300 dark:hover:bg-stone-600 transition-colors"
          >
            Reset
          </button>
          <button
            type="submit"
            className={`px-4 py-2 rounded-lg ${isDateValid ? 'bg-orange-600 hover:bg-orange-700' : 'bg-orange-400 cursor-not-allowed'} text-white transition-colors`}
            disabled={!isDateValid}
          >
            Add Experience
          </button>
        </div>
      </form>
    </div>
  );
}