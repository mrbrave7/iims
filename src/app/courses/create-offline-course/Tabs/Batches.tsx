"use client";
import React, { useEffect, useState, useMemo } from "react";
import DOMPurify from "dompurify";
import {
  PiClock,
  PiIdentificationBadge,
  PiUser,
  PiUsers,
  PiCalendar,
  PiMapPin,
  PiTrash,
} from "react-icons/pi";

// Interfaces
interface BatchDetails {
  batchName: string;
  batchInstructors: Batch_Instructor[];
  batchStartDate: string; // Changed to string for input compatibility
  maxStudentCount: number;
  enrollmentStartDate: string;
  enrollmentEndDate: string;
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
}

interface BatchErrors {
  batchName: string;
  batchInstructors: string;
  batchStartDate: string;
  maxStudentCount: string;
  enrollmentStartDate: string;
  enrollmentEndDate: string;
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
}

interface BatchTabProps {
  batches: BatchDetails[];
  batchDetails: BatchDetails;
  batchErrors: BatchErrors;
  onBatchChange: (name: keyof BatchDetails, value: string | number | Batch_Instructor[]) => void;
  onAddressChange: (name: keyof BatchDetails["address"], value: string) => void;
  onAddInstructor: (instructor: Batch_Instructor) => void;
  onRemoveInstructor: (index: number) => void;
  onAddBatches: () => void;
  onRemoveBatches: (index: number) => void;
}

interface Batch_Instructor {
  id: string;
  profile_details: {
    id: string;
    avatarUrl: string;
    fullName: string;
  };
}

const BatchTab: React.FC<BatchTabProps> = ({
  batches,
  batchDetails,
  batchErrors,
  onBatchChange,
  onAddressChange,
  onAddInstructor,
  onRemoveInstructor,
  onAddBatches,
  onRemoveBatches,
}) => {
  const [instructorInput, setInstructorInput] = useState<string>("");
  const [instructors, setInstructors] = useState<Batch_Instructor[]>([]);
  const [selectedInstructor, setSelectedInstructor] = useState<Batch_Instructor | null>(null);
  const [showInstructorList, setShowInstructorList] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Derive filtered instructors
  const searchedInstructors = useMemo(() => {
    if (!instructorInput) return instructors;
    return instructors.filter((ins: Batch_Instructor) =>
      ins?.profile_details?.fullName.toLowerCase().includes(instructorInput.toLowerCase())
    );
  }, [instructors, instructorInput]);
  // useEffect(() => {console.log(instructors)},[instructors])

  // Handle instructor input change
  const handleInstructorInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInstructorInput(e.target.value);
    setShowInstructorList(true);
  };

  // Select an instructor from the list
  const handleSelectInstructor = (instructor: Batch_Instructor) => {
    setSelectedInstructor(instructor);
    setInstructorInput(instructor?.profile_details?.fullName);
    setShowInstructorList(false);
  };

  // Add selected instructor to the batch
  const handleAddInstructor = () => {
    if (selectedInstructor) {
      onAddInstructor(selectedInstructor);
      setSelectedInstructor(null);
      setInstructorInput("");
    }
  };

  // Fetch instructors from API
  async function getInstructors() {
    setIsLoading(true);
    setError(null);
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

  // Input styling
  const inputClass = (hasError: boolean, hasValue: boolean | number | string) =>
    `pl-10 outline-none w-full rounded-lg border ${
      hasError
        ? "border-red-500"
        : hasValue || hasValue === 0
        ? "border-orange-500"
        : "border-stone-300 dark:border-stone-700"
    } bg-stone-100 dark:bg-stone-800 py-2 px-3 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent`;

  // Check if form has errors to disable Add Batch button
  const hasFormErrors = useMemo(() => {
    return (
      Object.entries(batchErrors).some(([key, error]) => {
        if (key === "address") return false; // Handled separately
        if (key === "batchInstructors") return !batchDetails.batchInstructors.length;
        return typeof error === "string" && !!error;
      }) || Object.values(batchErrors.address).some((error) => !!error)
    );
  }, [batchErrors, batchDetails.batchInstructors]);
  useEffect(() => {console.log(batchErrors)},[hasFormErrors])

  return (
    <div className="rounded-lg">
      <h2 className="text-2xl font-bold mb-6 text-orange-600">Batch Details</h2>

      <div>
        <div className="mb-4 flex w-full gap-4">
          {/* Batch Name */}
          <div className="mb-4 w-full">
            <label
              htmlFor="batchName"
              className="block text-orange-600 font-bold mb-1"
            >
              Batch Name *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <PiIdentificationBadge className="h-5 w-5 text-stone-400" />
              </div>
              <input
                type="text"
                id="batchName"
                value={batchDetails.batchName}
                onChange={(e) => onBatchChange("batchName", e.target.value)}
                className={inputClass(!!batchErrors.batchName, !!batchDetails.batchName)}
                placeholder="Enter batch name"
                aria-invalid={!!batchErrors.batchName}
                aria-describedby={batchErrors.batchName ? "batchName-error" : undefined}
                aria-required="true"
              />
            </div>
            <div aria-live="assertive">
              {batchErrors.batchName && (
                <p id="batchName-error" className="text-red-500 text-sm mt-1">
                  {batchErrors.batchName}
                </p>
              )}
            </div>
          </div>

          {/* Batch Instructors */}
          <div className="mb-4 w-full">
            <label
              htmlFor="batchInstructors"
              className="block text-orange-600 font-bold mb-1"
            >
              Instructors *
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <PiUser className="h-5 w-5 text-stone-400" />
                </div>
                <input
                  type="text"
                  id="batchInstructors"
                  value={instructorInput}
                  onChange={handleInstructorInputChange}
                  className={inputClass(!!batchErrors.batchInstructors, !!instructorInput)}
                  placeholder="Search Instructor"
                  onFocus={() => setShowInstructorList(true)}
                  onBlur={() => setTimeout(() => setShowInstructorList(false), 200)}
                  aria-label="Search Instructor"
                  aria-invalid={!!batchErrors.batchInstructors}
                  aria-describedby={batchErrors.batchInstructors ? "batchInstructors-error" : undefined}
                  aria-required="true"
                />
              </div>
              <button
                type="button"
                onClick={handleAddInstructor}
                disabled={!selectedInstructor}
                className={`p-2 rounded ${
                  selectedInstructor
                    ? "bg-orange-600 text-stone-100 hover:bg-orange-500"
                    : "bg-stone-400 cursor-not-allowed"
                }`}
                aria-label="Add instructor"
              >
                Add
              </button>
            </div>
            {isLoading && <p className="text-stone-500 mt-2">Loading instructors...</p>}
            {error && <p className="text-red-500 mt-2">{error}</p>}
            {showInstructorList && (
              <ul
                className="w-full max-h-48 overflow-y-scroll flex flex-col gap-4 bg-stone-600/50 rounded mt-1"
                role="listbox"
                aria-label="Instructor search results"
              >
                {searchedInstructors.length > 0 ? (
                  searchedInstructors.map((ins: Batch_Instructor) => (
                    <li
                      key={ins.id}
                      className="flex p-2 rounded gap-4 cursor-pointer hover:bg-stone-100 dark:hover:bg-stone-700"
                      onClick={() => handleSelectInstructor(ins)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          handleSelectInstructor(ins);
                        }
                      }}
                      tabIndex={0}
                      role="option"
                      aria-selected={selectedInstructor?.id === ins.id}
                    >
                      <img
                        className="h-10 w-10 rounded-full"
                        src={DOMPurify.sanitize(ins?.profile_details?.avatarUrl) || "https://www.google.com/url?sa=i&url=https%3A%2F%2Fcommons.wikimedia.org%2Fwiki%2FFile%3ASample_User_Icon.png&psig=AOvVaw0q2V_RvOYtHaQTfgKllcB0&ust=1746073676805000&source=images&cd=vfe&opi=89978449&ved=0CBAQjRxqFwoTCKi1hrv1_owDFQAAAAAdAAAAABAJ"}
                        alt={DOMPurify.sanitize(ins?.profile_details?.fullName)}
                      />
                      <span>{DOMPurify.sanitize(ins?.profile_details?.fullName)}</span>
                    </li>
                  ))
                ) : (
                  <li className="p-2 text-stone-500">No instructors found</li>
                )}
              </ul>
            )}
            <div aria-live="assertive">
              {batchErrors.batchInstructors && (
                <p id="batchInstructors-error" className="text-red-500 text-sm mt-1">
                  {batchErrors.batchInstructors}
                </p>
              )}
            </div>
            <ul className="mt-2" aria-label="Selected instructors">
              {batchDetails.batchInstructors.length > 0 ? (
                batchDetails.batchInstructors.map((instructor, index) => (
                  <li
                    key={instructor.id}
                    className="flex justify-between items-center p-2 rounded mb-1"
                  >
                    <span className="flex items-center gap-4">
                      <img
                        className="h-10 w-10 rounded-full"
                        src={DOMPurify.sanitize(instructor.profile_details.avatarUrl)}
                        alt=""
                      />
                      <p className="text-orange-600 font-bold">
                        {DOMPurify.sanitize(instructor.profile_details.fullName || "Unknown Instructor")}
                      </p>
                    </span>
                    <button
                      type="button"
                      onClick={() => onRemoveInstructor(index)}
                      className="text-red-500 cursor-pointer hover:text-red-700"
                      aria-label={`Remove instructor ${instructor.profile_details.fullName || "Unknown"}`}
                    >
                      <PiTrash />
                    </button>
                  </li>
                ))
              ) : (
                <li className="text-stone-500">No instructors added</li>
              )}
            </ul>
          </div>
        </div>

        <div className="mb-4 flex w-full gap-4">
          {/* Batch Start Date */}
          <div className="mb-4 w-full">
            <label
              htmlFor="batchStartDate"
              className="block text-orange-600 font-bold mb-1"
            >
              Batch Start Date *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <PiClock className="h-5 w-5 text-stone-400" />
              </div>
              <input
                type="date"
                id="batchStartDate"
                value={batchDetails.batchStartDate}
                onChange={(e) => onBatchChange("batchStartDate", e.target.value)}
                className={inputClass(!!batchErrors.batchStartDate, !!batchDetails.batchStartDate)}
                aria-invalid={!!batchErrors.batchStartDate}
                aria-describedby={batchErrors.batchStartDate ? "batchStartDate-error" : undefined}
                aria-required="true"
              />
            </div>
            <div aria-live="assertive">
              {batchErrors.batchStartDate && (
                <p id="batchStartDate-error" className="text-red-500 text-sm mt-1">
                  {batchErrors.batchStartDate}
                </p>
              )}
            </div>
          </div>

          {/* Max Student Count */}
          <div className="mb-4 w-full">
            <label
              htmlFor="maxStudentCount"
              className="block text-orange-600 font-bold mb-1"
            >
              Maximum Student Count *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <PiUsers className="h-5 w-5 text-stone-400" />
              </div>
              <input
                type="number"
                id="maxStudentCount"
                value={batchDetails.maxStudentCount || ""}
                onChange={(e) => onBatchChange("maxStudentCount", parseInt(e.target.value) || 0)}
                className={inputClass(!!batchErrors.maxStudentCount, batchDetails.maxStudentCount || batchDetails.maxStudentCount === 0)}
                min="1"
                placeholder="Enter max student count"
                aria-invalid={!!batchErrors.maxStudentCount}
                aria-describedby={batchErrors.maxStudentCount ? "maxStudentCount-error" : undefined}
                aria-required="true"
              />
            </div>
            <div aria-live="assertive">
              {batchErrors.maxStudentCount && (
                <p id="maxStudentCount-error" className="text-red-500 text-sm mt-1">
                  {batchErrors.maxStudentCount}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Enrollment Dates */}
        <div className="mb-4 flex gap-4 w-full">
          <div className="flex-1">
            <label
              htmlFor="enrollmentStartDate"
              className="block text-orange-600 font-bold mb-1"
            >
              Enrollment Start Date *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <PiCalendar className="h-5 w-5 text-stone-400" />
              </div>
              <input
                type="date"
                id="enrollmentStartDate"
                value={batchDetails.enrollmentStartDate}
                onChange={(e) => onBatchChange("enrollmentStartDate", e.target.value)}
                className={inputClass(!!batchErrors.enrollmentStartDate, !!batchDetails.enrollmentStartDate)}
                aria-invalid={!!batchErrors.enrollmentStartDate}
                aria-describedby={batchErrors.enrollmentStartDate ? "enrollmentStartDate-error" : undefined}
                aria-required="true"
              />
            </div>
            <div aria-live="assertive">
              {batchErrors.enrollmentStartDate && (
                <p id="enrollmentStartDate-error" className="text-red-500 text-sm mt-1">
                  {batchErrors.enrollmentStartDate}
                </p>
              )}
            </div>
          </div>
          <div className="flex-1">
            <label
              htmlFor="enrollmentEndDate"
              className="block text-orange-600 font-bold mb-1"
            >
              Enrollment End Date *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <PiCalendar className="h-5 w-5 text-stone-400" />
              </div>
              <input
                type="date"
                id="enrollmentEndDate"
                value={batchDetails.enrollmentEndDate}
                onChange={(e) => onBatchChange("enrollmentEndDate", e.target.value)}
                className={inputClass(!!batchErrors.enrollmentEndDate, !!batchDetails.enrollmentEndDate)}
                aria-invalid={!!batchErrors.enrollmentEndDate}
                aria-describedby={batchErrors.enrollmentEndDate ? "enrollmentEndDate-error" : undefined}
                aria-required="true"
              />
            </div>
            <div aria-live="assertive">
              {batchErrors.enrollmentEndDate && (
                <p id="enrollmentEndDate-error" className="text-red-500 text-sm mt-1">
                  {batchErrors.enrollmentEndDate}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="mb-4">
          <h3 className="text-lg font-bold text-orange-600 mb-2">
            Institution Address *
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label
                htmlFor="street"
                className="block text-orange-600 font-bold mb-1"
              >
                Street *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <PiMapPin className="h-5 w-5 text-stone-400" />
                </div>
                <input
                  type="text"
                  id="street"
                  value={batchDetails.address.street}
                  onChange={(e) => onAddressChange("street", e.target.value)}
                  className={inputClass(!!batchErrors.address.street, !!batchDetails.address.street)}
                  placeholder="Enter street"
                  aria-invalid={!!batchErrors.address.street}
                  aria-describedby={batchErrors.address.street ? "street-error" : undefined}
                  aria-required="true"
                />
              </div>
              <div aria-live="assertive">
                {batchErrors.address.street && (
                  <p id="street-error" className="text-red-500 text-sm mt-1">
                    {batchErrors.address.street}
                  </p>
                )}
              </div>
            </div>
            <div>
              <label
                htmlFor="city"
                className="block text-orange-600 font-bold mb-1"
              >
                City *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <PiMapPin className="h-5 w-5 text-stone-400" />
                </div>
                <input
                  type="text"
                  id="city"
                  value={batchDetails.address.city}
                  onChange={(e) => onAddressChange("city", e.target.value)}
                  className={inputClass(!!batchErrors.address.city, !!batchDetails.address.city)}
                  placeholder="Enter city"
                  aria-invalid={!!batchErrors.address.city}
                  aria-describedby={batchErrors.address.city ? "city-error" : undefined}
                  aria-required="true"
                />
              </div>
              <div aria-live="assertive">
                {batchErrors.address.city && (
                  <p id="city-error" className="text-red-500 text-sm mt-1">
                    {batchErrors.address.city}
                  </p>
                )}
              </div>
            </div>
            <div>
              <label
                htmlFor="state"
                className="block text-orange-600 font-bold mb-1"
              >
                State *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <PiMapPin className="h-5 w-5 text-stone-400" />
                </div>
                <input
                  type="text"
                  id="state"
                  value={batchDetails.address.state}
                  onChange={(e) => onAddressChange("state", e.target.value)}
                  className={inputClass(!!batchErrors.address.state, !!batchDetails.address.state)}
                  placeholder="Enter state"
                  aria-invalid={!!batchErrors.address.state}
                  aria-describedby={batchErrors.address.state ? "state-error" : undefined}
                  aria-required="true"
                />
              </div>
              <div aria-live="assertive">
                {batchErrors.address.state && (
                  <p id="state-error" className="text-red-500 text-sm mt-1">
                    {batchErrors.address.state}
                  </p>
                )}
              </div>
            </div>
            <div>
              <label
                htmlFor="country"
                className="block text-orange-600 font-bold mb-1"
              >
                Country *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <PiMapPin className="h-5 w-5 text-stone-400" />
                </div>
                <input
                  type="text"
                  id="country"
                  value={batchDetails.address.country}
                  onChange={(e) => onAddressChange("country", e.target.value)}
                  className={inputClass(!!batchErrors.address.country, !!batchDetails.address.country)}
                  placeholder="Enter country"
                  aria-invalid={!!batchErrors.address.country}
                  aria-describedby={batchErrors.address.country ? "country-error" : undefined}
                  aria-required="true"
                />
              </div>
              <div aria-live="assertive">
                {batchErrors.address.country && (
                  <p id="country-error" className="text-red-500 text-sm mt-1">
                    {batchErrors.address.country}
                  </p>
                )}
              </div>
            </div>
            <div>
              <label
                htmlFor="zipCode"
                className="block text-orange-600 font-bold mb-1"
              >
                Zip Code *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <PiMapPin className="h-5 w-5 text-stone-400" />
                </div>
                <input
                  type="text"
                  id="zipCode"
                  value={batchDetails.address.zipCode}
                  onChange={(e) => onAddressChange("zipCode", e.target.value)}
                  className={inputClass(!!batchErrors.address.zipCode, !!batchDetails.address.zipCode)}
                  placeholder="Enter zip code"
                  aria-invalid={!!batchErrors.address.zipCode}
                  aria-describedby={batchErrors.address.zipCode ? "zipCode-error" : undefined}
                  aria-required="true"
                />
              </div>
              <div aria-live="assertive">
                {batchErrors.address.zipCode && (
                  <p id="zipCode-error" className="text-red-500 text-sm mt-1">
                    {batchErrors.address.zipCode}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Add Batch Button */}
        <div className="mt-6">
          <button
            type="button"
            onClick={onAddBatches}
            className={`w-full rounded-lg py-2 px-4 transition-colorsb bg-orange-600 text-stone-100 hover:bg-orange-500`}
            aria-label="Add batch"
          >
            Add Batch
          </button>
        </div>
      </div>

      {/* Existing Batches */}
      <div className="mt-8">
        <h3 className="text-lg font-bold text-orange-600 mb-4">
          Created Batches
        </h3>
        {batches.length === 0 ? (
          <p className="text-stone-500">No batches created yet.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {batches.map((batch: BatchDetails, index: number) => (
              <div
                key={index}
                className="p-4 bg-stone-100 dark:bg-stone-800 rounded-lg border border-stone-200 dark:border-stone-700"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
                      {DOMPurify.sanitize(batch.batchName)}
                    </h4>
                    <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-stone-600 dark:text-stone-400">
                      <p>
                        <span className="font-medium">Instructors:</span>{" "}
                        {batch.batchInstructors
                          .map((ins) => DOMPurify.sanitize(ins.profile_details.fullName || "Unknown"))
                          .join(", ") || "None"}
                      </p>
                      <p>
                        <span className="font-medium">Start Date:</span>{" "}
                        {batch.batchStartDate
                          ? new Date(batch.batchStartDate).toLocaleDateString()
                          : "Not set"}
                      </p>
                      <p>
                        <span className="font-medium">Max Students:</span>{" "}
                        {batch.maxStudentCount || "Not set"}
                      </p>
                      <p>
                        <span className="font-medium">Enrollment Period:</span>{" "}
                        {batch.enrollmentStartDate
                          ? new Date(batch.enrollmentStartDate).toLocaleDateString()
                          : "Not set"}{" "}
                        -{" "}
                        {batch.enrollmentEndDate
                          ? new Date(batch.enrollmentEndDate).toLocaleDateString()
                          : "Not set"}
                      </p>
                      <p>
                        <span className="font-medium">Address:</span>{" "}
                        {batch.address.street
                          ? DOMPurify.sanitize(
                              `${batch.address.street}, ${batch.address.city}, ${batch.address.state} ${batch.address.zipCode}, ${batch.address.country}`
                            )
                          : "Not set"}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onRemoveBatches(index)}
                    className="text-red-500 hover:text-red-700 font-medium"
                    aria-label={`Remove batch ${DOMPurify.sanitize(batch.batchName)}`}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BatchTab;