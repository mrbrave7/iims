"use client";
import React, { useState, useMemo, useCallback, useEffect } from "react";
import { PiPlus, PiTrash, PiUser, PiCalendar, PiLink, PiBookOpenText, PiWarning, PiCheck } from "react-icons/pi";
import { useAdminContext } from "../Context/AdminProvider";
import { useRouter } from "next/navigation";
import { usePopupContext } from "../Context/ToastProvider";
import Head from "next/head";

// Centralized constants
const constants = {
  MAX_TEXT_LENGTH: 500,
  MAX_SHORT_TEXT_LENGTH: 100,
  LOCAL_STORAGE_KEY_PREFIX: "instructorProfile_",
};

// Utility functions
const parseDate = (value: string): Date | null => {
  const date = new Date(value);
  return isNaN(date.getTime()) ? null : date;
};
// Validation functions
// URL validation
const isValidUrl = (url: string): boolean => {
  if (!url.trim()) return false; // Empty string is invalid

  try {
    // Add https:// if no protocol is present
    let testUrl = url.trim();
    if (!/^https?:\/\//i.test(testUrl)) {
      testUrl = `https://${testUrl}`;
    }
    new URL(testUrl);
    return true;
  } catch {
    return false;
  }
};
// Validation functions
// Required field validation
const validateRequired = (value: string, field: string): string | null => {
  const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);
  return value.trim() ? null : `${capitalize(field)} is required`;
};
// URL validation
const validateUrl = (url: string): string => {
  if (!url.trim()) return ""; // Don't validate empty fields (unless required)
  return isValidUrl(url) ? "" : "Invalid URL (include http:// or https://)";
};
// Max length validation
const validateMaxLength = (value: string, max: number, field: string): string =>
  value.length <= max ? "" : `${field} must be less than ${max} characters`;

// Social media Interfaces  
interface I_Social_Media {
  siteName: string;
  siteUrl: string;
}
// Interface for experiences
interface I_Experiences {
  workedOrganization: string;
  workDurationInMonths: number;
  organizationJoiningDate: Date;
  organizationLeaveDate: Date;
  role: string;
  workDescription: string;
}
// Interface for certifications
interface I_Certifications {
  recipientName: string;
  certificationTitle: string;
  issuedOrganization: string;
  certificateId?: string;
  durationOfTrainingInWeeks?: number; // Fixed typo
  certificationScore?: number;
  certificateFileUrl?: string; // CamelCase for consistency
  issuedDate: Date;
  specialMessage?: string;
}
// Main profile interface
export interface I_Profile {
  fullName: string;
  dateOfBirth: Date;
  avatarUrl: string;
  shortBio: string; // CamelCase for consistency
  socialMediaAccounts: I_Social_Media[];
  certifications: I_Certifications[];
  experiences: I_Experiences[];
  specialization: string[];
}
// Experience Error Interface
interface ExperienceFormErrors {
  workedOrganization?: string;
  workDurationInMonths?: string;
  organizationJoiningDate?: string;
  organizationLeaveDate?: string;
  role?: string;
  workDescription?: string;
}
// Certification Error Interface
interface CertificationFormErrors {
  recipientName?: string;
  certificationTitle?: string;
  issuedOrganization?: string;
  certificateId?: string;
  durationOfTrainingInWeeks?: string;
  certificationScore?: string;
  certificateFileUrl?: string;
  issuedDate?: string;
  specialMessage?: string;
}
// form error interface
interface FormErrors {
  fullName?: string;
  dateOfBirth?: string;
  avatarUrl?: string;
  socialMedia?: { siteName?: string; siteUrl?: string };
  shortBio?: string;
  specialization?: string;
  certification?: CertificationFormErrors;
  experience?: ExperienceFormErrors;
}
// Main component
export default function InstructorProfilePage(): React.ReactElement {
  // Contexts
  const { adminId, admin } = useAdminContext();
  const router = useRouter();
  const { Popup } = usePopupContext();
  const toast = Popup();


  // Authentication check
  useEffect(() => {
    if (!adminId) {
      router.push("/admins/signin")
    }
  }, [adminId, router]);
  useEffect(() => {
    if (admin?.profile_details) {
      router.push("/");
    }
  }, [admin?.profile_details, router]);
  // Local storage key
  const LOCAL_STORAGE_KEY = `${constants.LOCAL_STORAGE_KEY_PREFIX}${adminId}`;

  // Initial state
  const [instructorDetails, setInstructorDetails] = useState<I_Profile>({
    fullName: "",
    dateOfBirth: new Date(),
    avatarUrl: "",
    shortBio: "",
    socialMediaAccounts: [],
    certifications: [],
    experiences: [],
    specialization: [],
  });
  const [newExperience, setNewExperience] = useState<Partial<I_Experiences>>({
    workedOrganization: "",
    workDurationInMonths: 0,
    organizationJoiningDate: new Date(),
    organizationLeaveDate: new Date(),
    role: "",
    workDescription: "",
  });
  const [newCertification, setNewCertification] = useState<I_Certifications>({
    recipientName: "",
    certificationTitle: "",
    issuedOrganization: "",
    certificateId: "",
    durationOfTrainingInWeeks: 0,
    certificationScore: 0,
    certificateFileUrl: "",
    issuedDate: new Date(),
    specialMessage: "",
  });
  const [activeTab, setActiveTab] = useState<"basic" | "certs" | "exp">("basic");
  const [newSpecialization, setNewSpecialization] = useState("");
  const [newSocialMedia, setNewSocialMedia] = useState<I_Social_Media>({ siteName: "", siteUrl: "" });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitStatus, setSubmitStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  // Load saved data from localStorage
  useEffect(() => {
    const handler = setTimeout(() => {
      try {
        const currentData = JSON.stringify(instructorDetails);
        if (currentData !== localStorage.getItem(LOCAL_STORAGE_KEY)) {
          localStorage.setItem(LOCAL_STORAGE_KEY, currentData);
        }
      } catch (error) {
        console.error("Failed to save form data:", error);
        toast.error("Failed to save draft");
      }
    }, 500);
    return () => clearTimeout(handler);
  }, [instructorDetails, LOCAL_STORAGE_KEY, toast]);
  // Save to localStorage with optimization
  useEffect(() => {
    const saveData = () => {
      try {
        const currentData = JSON.stringify(instructorDetails);
        if (currentData !== localStorage.getItem(LOCAL_STORAGE_KEY)) {
          localStorage.setItem(LOCAL_STORAGE_KEY, currentData);
        }
      } catch (error) {
        console.error("Failed to save form data:", error);
        toast.error("Failed to save draft");
      }
    };
    const debouncedSave = setTimeout(saveData, 500);
    return () => clearTimeout(debouncedSave);
  }, [instructorDetails, LOCAL_STORAGE_KEY, toast]);
  // Validation functions
  const validateBasicInfo = useCallback(() => {
    const newErrors: FormErrors = {};
    const { fullName, dateOfBirth, avatarUrl, shortBio } = instructorDetails;
    const today = new Date();

    // Required fields
    newErrors.fullName = validateRequired(fullName, "full name") || validateMaxLength(fullName, constants.MAX_SHORT_TEXT_LENGTH, "Name") || "";

    // Date of Birth validation
    if (!dateOfBirth || isNaN(dateOfBirth.getTime())) {
      newErrors.dateOfBirth = "Valid date of birth is required";
    } else if (dateOfBirth >= today) {
      newErrors.dateOfBirth = "Date of birth must be in the past";
    }

    // Optional fields
    if (avatarUrl) {
      newErrors.avatarUrl = validateUrl(avatarUrl);
    }
    if (shortBio) {
      newErrors.shortBio = validateMaxLength(shortBio, constants.MAX_TEXT_LENGTH, "Bio");
    }

    // Clean up empty error strings
    const cleanedErrors = Object.fromEntries(
      Object.entries(newErrors).filter(([_, value]) => value !== "" && value !== null)
    );

    setErrors((prev) => ({ ...prev, ...cleanedErrors }));
    const isValid = Object.keys(cleanedErrors).length === 0;
    console.log("Basic info validation errors:", cleanedErrors);
    console.log("Is valid:", isValid);
    return isValid;
  }, [instructorDetails]);
  // Validation Certification
  const validateCertification = useCallback((cert: I_Certifications) => {
    const newErrors: CertificationFormErrors = {};
    const today = new Date();

    // Validate required fields
    newErrors.recipientName = validateRequired(cert.recipientName, "recipient name") || "";
    newErrors.certificationTitle = validateRequired(cert.certificationTitle, "certification title") || "";
    newErrors.issuedOrganization = validateRequired(cert.issuedOrganization, "issuing organization") || "";

    // Validate issuedDate
    if (!cert.issuedDate || isNaN(cert.issuedDate.getTime())) {
      newErrors.issuedDate = "Valid issued date is required";
    } else if (cert.issuedDate > today) {
      newErrors.issuedDate = "Issued date cannot be in the future";
    }

    // Validate optional fields if provided
    if (cert.certificateFileUrl) {
      newErrors.certificateFileUrl = validateUrl(cert.certificateFileUrl);
    }
    if (cert.durationOfTrainingInWeeks !== undefined && cert.durationOfTrainingInWeeks < 0) {
      newErrors.durationOfTrainingInWeeks = "Duration cannot be negative";
    }
    if (cert.certificationScore !== undefined && cert.certificationScore < 0) {
      newErrors.certificationScore = "Score cannot be negative";
    }

    // Remove empty error strings for cleaner object
    const cleanedErrors = Object.fromEntries(
      Object.entries(newErrors).filter(([_, value]) => value !== "")
    );

    setErrors((prev) => ({ ...prev, certification: cleanedErrors }));
    const isValid = Object.keys(cleanedErrors).length === 0;
    return isValid;
  }, []);
  // Validation Experience
  const validateExperience = useCallback((exp: Partial<I_Experiences>) => {
    const newErrors: ExperienceFormErrors = {};
    const today = new Date();

    // Required fields
    newErrors.role = validateRequired(exp.role || "", "role") || "";
    newErrors.workedOrganization = validateRequired(exp.workedOrganization || "", "organization") || "";
    newErrors.workDescription = validateRequired(exp.workDescription || "", "description") || validateMaxLength(exp.workDescription || "", constants.MAX_TEXT_LENGTH, "Description");

    // Validate organizationJoiningDate (required)
    if (!exp.organizationJoiningDate || isNaN(exp.organizationJoiningDate.getTime())) {
      newErrors.organizationJoiningDate = "Valid start date is required";
    } else if (exp.organizationJoiningDate > today) {
      newErrors.organizationJoiningDate = "Start date cannot be in the future";
    }

    // Validate workDurationInMonths (optional, but check if negative)
    if (exp.workDurationInMonths !== undefined && exp.workDurationInMonths < 0) {
      newErrors.workDurationInMonths = "Duration cannot be negative";
    }

    // Validate organizationLeaveDate (optional, but check if provided)
    if (exp.organizationLeaveDate) {
      if (isNaN(exp.organizationLeaveDate.getTime())) {
        newErrors.organizationLeaveDate = "Valid end date is required if provided";
      } else if (exp.organizationJoiningDate && exp.organizationLeaveDate < exp.organizationJoiningDate) {
        newErrors.organizationLeaveDate = "End date must be after start date";
      } else if (exp.organizationLeaveDate > today) {
        newErrors.organizationLeaveDate = "End date cannot be in the future";
      }
    }

    // Remove empty error strings
    const cleanedErrors = Object.fromEntries(
      Object.entries(newErrors).filter(([_, value]) => value !== "")
    );

    setErrors((prev) => ({ ...prev, experience: cleanedErrors }));
    const isValid = Object.keys(cleanedErrors).length === 0;
    console.log("Experience validation errors:", cleanedErrors);
    console.log("Is valid:", isValid);
    return isValid;
  }, []);
  // Validation Social Media
  const validateSocialMedia = useCallback((sm: Partial<I_Social_Media>) => {
    const newErrors: FormErrors = {};

    newErrors.socialMedia = {
      siteName: validateRequired(sm.siteName || "", "Platform name") || undefined,
      siteUrl: sm.siteUrl?.trim() ? validateUrl(sm.siteUrl) : validateRequired(sm.siteUrl || "", "URL") || undefined
    };

    setErrors((prev) => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors.socialMedia || {}).filter(k => newErrors.socialMedia?.[k as keyof typeof newErrors.socialMedia]).length === 0;
  }, []);
  // Handler Basic Info
  const handleBasicInfoChange = useCallback((field: keyof I_Profile, value: any) => {
    setInstructorDetails((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }, []);
  // Handler Add Certification
  const handleAddCertification = useCallback(() => {
    if (validateCertification(newCertification)) {
      setInstructorDetails((prev) => ({
        ...prev,
        certifications: [...(prev.certifications || []), newCertification],
      }));
      setNewCertification({
        recipientName: "",
        certificationTitle: "",
        issuedOrganization: "",
        certificateId: "",
        durationOfTrainingInWeeks: 0,
        certificationScore: 0,
        certificateFileUrl: "",
        issuedDate: new Date(),
        specialMessage: "",
      });
      toast.success("Certification added successfully!");
    } else {
      toast.error("Please fix the certification errors before adding.");
    }
  }, [newCertification, validateCertification, toast]);
  // Handler Remove Certification
  const handleRemoveCertification = useCallback((index: number) => {
    if (confirm("Are you sure you want to remove this certification?")) {
      setInstructorDetails((prev) => ({
        ...prev,
        certifications: prev.certifications.filter((_, i) => i !== index),
      }));
    }
  }, []);
  // Handler Add Experience
  const handleAddExperience = useCallback(() => {
    if (validateExperience(newExperience)) {
      setInstructorDetails((prev) => ({
        ...prev,
        experiences: [...(prev.experiences || []), newExperience as I_Experiences],
      }));
      setNewExperience({
        workedOrganization: "",
        workDurationInMonths: 0,
        organizationJoiningDate: new Date(),
        organizationLeaveDate: new Date(),
        role: "",
        workDescription: "",
      });
      toast.success("Experience added successfully!");
    } else {
      toast.error("Please fix the experience errors before adding.");
    }
  }, [newExperience, validateExperience, toast]);
  // Handler Remove Experience
  const handleRemoveExperience = useCallback((index: number) => {
    if (confirm("Are you sure you want to remove this experience?")) {
      setInstructorDetails((prev) => ({
        ...prev,
        experiences: prev.experiences.filter((_, i) => i !== index),
      }));
    }
  }, []);
  // Handler Add Specialization
  const handleAddSpecialization = useCallback(() => {
    if (newSpecialization.trim()) {
      setInstructorDetails((prev) => ({
        ...prev,
        specialization: [...(prev.specialization || []), newSpecialization.trim()],
      }));
      setNewSpecialization("");
    }
  }, [newSpecialization]);
  // Handler Remove Specialization
  const handleRemoveSpecialization = useCallback((index: number) => {
    if (confirm("Are you sure you want to remove this specialization?")) {
      setInstructorDetails((prev) => ({
        ...prev,
        specialization: prev.specialization.filter((_, i) => i !== index),
      }));
    }
  }, []);
  // Handler Add Social Media
  const handleAddSocialMedia = useCallback(() => {
    if (validateSocialMedia(newSocialMedia)) {
      setInstructorDetails((prev) => ({
        ...prev,
        socialMediaAccounts: [...(prev.socialMediaAccounts || []), newSocialMedia],
      }));
      setNewSocialMedia({ siteName: "", siteUrl: "" });
    }
  }, [newSocialMedia, validateSocialMedia]);
  // Handler Remove Social Media
  const handleRemoveSocialMedia = useCallback((index: number) => {
    if (confirm("Are you sure you want to remove this social media account?")) {
      setInstructorDetails((prev) => ({
        ...prev,
        socialMediaAccounts: prev.socialMediaAccounts.filter((_, i) => i !== index),
      }));
    }
  }, []);
  // Handler Date Change
  const handleDateChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const date = parseDate(e.target.value);
      if (date) handleBasicInfoChange("dateOfBirth", date);
    },
    [handleBasicInfoChange]
  );
  // Handler Certification Issued Date
  const handleCertificationIssuedDate = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const date = parseDate(e.target.value);
      if (date) {
        setNewCertification((prev) => ({ ...prev, issuedDate: date }));
        setErrors((prev) => ({ ...prev, certification: { ...prev.certification, issuedDate: undefined } }));
      }
    },
    []
  );
  // Handler Experience Start Date
  const handleExperienceStartDate = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const date = parseDate(e.target.value);
      if (date) {
        setNewExperience((prev) => ({ ...prev, organizationJoiningDate: date }));
        setErrors((prev) => ({ ...prev, experience: { ...prev.experience, organizationJoiningDate: undefined } }));
      }
    },
    []
  );
  // Handler Experience End Date
  const handleExperienceEndDate = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const date = parseDate(e.target.value);
      if (date) {
        setNewExperience((prev) => ({ ...prev, organizationLeaveDate: date }));
        setErrors((prev) => ({ ...prev, experience: { ...prev.experience, organizationLeaveDate: undefined } }));
      }
    },
    []
  );
  // handler Submit Form Data
  const handleSubmitForm = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      const isBasicValid = validateBasicInfo();
      const isCertsValid = instructorDetails.certifications.every(validateCertification);
      const isExpValid = instructorDetails.experiences.every(validateExperience);


      if (!isBasicValid || !isCertsValid || !isExpValid) {
        toast.error("Please fix all form errors before submitting");
        setSubmitStatus("error");
        (document.querySelector('[aria-invalid="true"]') as HTMLInputElement)?.focus(); // Focus first error
        return;
      }

      setSubmitStatus("submitting");
      toast.loading("Saving your profile...");


      try {
        const response = await fetch("/api/admin/create-profile", {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ instructorDetails, adminId }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to save profile");
        }
        else {
          toast.success("Profile saved successfully!");
          setSubmitStatus("success");
          localStorage.removeItem(LOCAL_STORAGE_KEY);
          router.push("/");
        }
      } catch (error) {
        console.error("Submission error:", error);
        toast.error(error instanceof Error ? error.message : "An unexpected error occurred");
        setSubmitStatus("error");
      }
    },
    [instructorDetails, validateBasicInfo, validateCertification, validateExperience, toast, router, adminId, LOCAL_STORAGE_KEY]
  );
  // Memoized tab components
  // Basic Info Tab
  const BasicInfoTab = useMemo(
    () => (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label htmlFor="fullName" className="block text-sm font-medium text-stone-700 dark:text-stone-300">
              Full Name*
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <PiUser className="h-5 w-5 text-stone-400" />
              </div>
              <input
                id="fullName"
                name="fullName"
                type="text"
                required={activeTab === "basic"}
                value={instructorDetails.fullName}
                onChange={(e) => handleBasicInfoChange("fullName", e.target.value)}
                className={`pl-10 w-full rounded-lg border ${errors.fullName ? "border-red-500" : "border-stone-300 dark:border-stone-700"} bg-stone-100 dark:bg-stone-800 py-2 px-3 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                placeholder="Enter your full name"
                maxLength={constants.MAX_SHORT_TEXT_LENGTH}
                aria-invalid={!!errors.fullName}
                aria-describedby="name-error"
              />
            </div>
            {errors.fullName && (
              <p id="name-error" className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                <PiWarning size={16} /> {errors.fullName}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <label htmlFor="dateOfBirth" className="block text-sm font-medium text-stone-700 dark:text-stone-300">
              Date of Birth*
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <PiCalendar className="h-5 w-5 text-stone-400" />
              </div>
              <input
                id="dateOfBirth"
                name="dateOfBirth"
                type="date"
                required
                value={instructorDetails.dateOfBirth.toISOString().split("T")[0]}
                onChange={handleDateChange}
                className={`pl-10 w-full rounded-lg border ${errors.dateOfBirth ? "border-red-500" : "border-stone-300 dark:border-stone-700"} bg-stone-100 dark:bg-stone-800 py-2 px-3 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                aria-invalid={!!errors.dateOfBirth}
                aria-describedby="dob-error"
              />
            </div>
            {errors.dateOfBirth && (
              <p id="dob-error" className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                <PiWarning size={16} /> {errors.dateOfBirth}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-1">
          <label htmlFor="avatarUrl" className="block text-sm font-medium text-stone-700 dark:text-stone-300">
            Avatar URL
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <PiLink className="h-5 w-5 text-stone-400" />
            </div>
            <input
              id="avatarUrl"
              name="avatarUrl"
              type="url"
              value={instructorDetails.avatarUrl}
              onChange={(e) => handleBasicInfoChange("avatarUrl", e.target.value)}
              className={`pl-10 w-full rounded-lg border ${errors.avatarUrl ? "border-red-500" : "border-stone-300 dark:border-stone-700"} bg-stone-100 dark:bg-stone-800 py-2 px-3 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
              placeholder="Enter image URL for your avatar"
              aria-invalid={!!errors.avatarUrl}
              aria-describedby="avatar-error"
            />
          </div>
          {errors.avatarUrl && (
            <p id="avatar-error" className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
              <PiWarning size={16} /> {errors.avatarUrl}
            </p>
          )}
          <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
            Provide a URL to your profile picture (e.g., from Gravatar or other image hosting)
          </p>
        </div>

        <div className="space-y-1">
          <label htmlFor="shortBio" className="block text-sm font-medium text-stone-700 dark:text-stone-300">
            Short Bio
          </label>
          <textarea
            id="shortBio"
            name="shortBio"
            value={instructorDetails.shortBio}
            onChange={(e) => handleBasicInfoChange("shortBio", e.target.value)}
            className={`w-full rounded-lg border ${errors.shortBio ? "border-red-500" : "border-stone-300 dark:border-stone-700"} bg-stone-100 dark:bg-stone-800 py-2 px-3 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent min-h-[100px]`}
            placeholder="Tell us about yourself (e.g., your teaching philosophy, background)"
            maxLength={constants.MAX_TEXT_LENGTH}
            aria-invalid={!!errors.shortBio}
            aria-describedby="bio-error"
          />
          {errors.shortBio && (
            <p id="bio-error" className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
              <PiWarning size={16} /> {errors.shortBio}
            </p>
          )}
          <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
            {instructorDetails.shortBio.length}/{constants.MAX_TEXT_LENGTH} characters
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="specialization" className="block text-sm font-medium text-stone-700 dark:text-stone-300">
              Specializations
            </label>
            <div className="flex gap-2">
              <input
                id="specialization"
                type="text"
                value={newSpecialization}
                onChange={(e) => setNewSpecialization(e.target.value)}
                className="flex-1 rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-100 dark:bg-stone-800 py-2 px-3 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Add a specialization (e.g., Web Development, Data Science)"
                maxLength={constants.MAX_SHORT_TEXT_LENGTH}
              />
              <button
                type="button"
                onClick={handleAddSpecialization}
                className="px-3 py-2 rounded-lg bg-orange-600 text-white hover:bg-orange-700 transition-colors flex items-center gap-1"
                aria-label="Add specialization"
              >
                <PiPlus size={16} /> Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {instructorDetails.specialization.map((spec, index) => (
                <div key={index} className="bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200 px-3 py-1 rounded-full flex items-center gap-2">
                  {spec}
                  <button
                    type="button"
                    onClick={() => handleRemoveSpecialization(index)}
                    className="text-orange-600 dark:text-orange-400 hover:text-orange-800 dark:hover:text-orange-200"
                    aria-label={`Remove ${spec} specialization`}
                  >
                    <PiTrash size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="siteName" className="block text-sm font-medium text-stone-700 dark:text-stone-300">
              Social Media Accounts
            </label>
            <div className="grid grid-cols-1 md:grid-cols-10 w-full gap-2">
              <input
                id="siteName"
                type="text"
                value={newSocialMedia.siteName}
                onChange={(e) => setNewSocialMedia((prev) => ({ ...prev, siteName: e.target.value }))}
                className={`rounded-lg border col-span-2 ${errors.socialMedia?.siteName ? "border-red-500" : "border-stone-300 dark:border-stone-700"} bg-stone-100 dark:bg-stone-800 py-2 px-3 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                placeholder="Platform (e.g. Twitter)"
                aria-invalid={!!errors.socialMedia?.siteName}
                aria-describedby="social-name-error"
              />
              <input
                type="text"
                value={newSocialMedia.siteUrl}
                onChange={(e) => setNewSocialMedia((prev) => ({ ...prev, siteUrl: e.target.value }))}
                className={`rounded-lg border col-span-7 ${errors.socialMedia?.siteUrl ? "border-red-500" : "border-stone-300 dark:border-stone-700"} bg-stone-100 dark:bg-stone-800 py-2 px-3 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                placeholder="Profile URL"
                aria-invalid={!!errors.socialMedia?.siteUrl}
                aria-describedby="social-url-error"
              />
              <button
                type="button"
                onClick={handleAddSocialMedia}
                className="px-3 py-2 rounded-lg bg-orange-600 text-white hover:bg-orange-700 transition-colors flex items-center justify-center gap-1"
                aria-label="Add social media account"
              >
                <PiPlus size={16} /> Add
              </button>
            </div>
            {(errors.socialMedia?.siteName || errors.socialMedia?.siteUrl) && (
              <div className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                <PiWarning size={16} />
                {errors.socialMedia?.siteName || errors.socialMedia?.siteUrl}
              </div>
            )}
            <div className="flex flex-wrap gap-3 mt-2">
              {instructorDetails.socialMediaAccounts.map((account, index) => (
                <div key={index} className="bg-stone-100 dark:bg-stone-700 text-orange-600 px-3 py-2 rounded-lg flex items-center gap-2">
                  <span className="font-medium">{account.siteName}</span>
                  <span className="text-stone-600 dark:text-stone-300 truncate max-w-xs">{account.siteUrl}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSocialMedia(index)}
                    className="text-stone-500 dark:text-stone-400 hover:text-red-500 dark:hover:text-red-400 ml-auto"
                    aria-label={`Remove ${account.siteName} account`}
                  >
                    <PiTrash size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    ),
    [instructorDetails.avatarUrl, instructorDetails.fullName, instructorDetails.shortBio, instructorDetails.socialMediaAccounts, newSpecialization, newSocialMedia, errors, handleBasicInfoChange, handleDateChange, handleAddSpecialization, handleRemoveSpecialization, handleAddSocialMedia, handleRemoveSocialMedia]
  );
  // Certifications Tab
  const CertificationsTab = useMemo(
    () => (
      <div className="space-y-6">
        <div className=" p-4 rounded-lg">
          <h3 className="text-lg font-medium text-stone-700 dark:text-stone-300 mb-4">Add New Certification</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="recipientName" className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                Recipient Name*
              </label>
              <input
                id="recipientName"
                type="text"
                value={newCertification.recipientName}
                onChange={(e) => setNewCertification((prev) => ({ ...prev, recipientName: e.target.value }))}
                className={`w-full rounded-lg border ${errors.certification?.recipientName ? "border-red-500" : "border-stone-300 dark:border-stone-700"} bg-stone-50 dark:bg-stone-800 py-2 px-3 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                placeholder="Your name as on certificate"
                required={!instructorDetails.certifications.length}
                maxLength={constants.MAX_SHORT_TEXT_LENGTH}
                aria-invalid={!!errors.certification?.recipientName}
                aria-describedby="cert-recipient-error"
              />
              {errors.certification?.recipientName && (
                <p id="cert-recipient-error" className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                  <PiWarning size={16} /> {errors.certification.recipientName}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="certificationTitle" className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                Certification Title*
              </label>
              <input
                id="certificationTitle"
                type="text"
                value={newCertification.certificationTitle}
                onChange={(e) => setNewCertification((prev) => ({ ...prev, certificationTitle: e.target.value }))}
                className={`w-full rounded-lg border ${errors.certification?.certificationTitle ? "border-red-500" : "border-stone-300 dark:border-stone-700"} bg-stone-50 dark:bg-stone-800 py-2 px-3 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                placeholder="e.g., Certified React Developer"
                required={!instructorDetails.certifications.length}
                maxLength={constants.MAX_SHORT_TEXT_LENGTH}
                aria-invalid={!!errors.certification?.certificationTitle}
                aria-describedby="cert-title-error"
              />
              {errors.certification?.certificationTitle && (
                <p id="cert-title-error" className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                  <PiWarning size={16} /> {errors.certification.certificationTitle}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="issuedOrganization" className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                Issuing Organization*
              </label>
              <input
                id="issuedOrganization"
                type="text"
                value={newCertification.issuedOrganization}
                onChange={(e) => setNewCertification((prev) => ({ ...prev, issuedOrganization: e.target.value }))}
                className={`w-full rounded-lg border ${errors.certification?.issuedOrganization ? "border-red-500" : "border-stone-300 dark:border-stone-700"} bg-stone-50 dark:bg-stone-800 py-2 px-3 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                placeholder="Organization that issued the certificate"
                required={!instructorDetails.certifications.length}
                maxLength={constants.MAX_SHORT_TEXT_LENGTH}
                aria-invalid={!!errors.certification?.issuedOrganization}
                aria-describedby="cert-org-error"
              />
              {errors.certification?.issuedOrganization && (
                <p id="cert-org-error" className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                  <PiWarning size={16} /> {errors.certification.issuedOrganization}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="certificateId" className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                Certificate ID
              </label>
              <input
                id="certificateId"
                type="text"
                value={newCertification.certificateId || ""}
                onChange={(e) => setNewCertification((prev) => ({ ...prev, certificateId: e.target.value }))}
                className="w-full rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 py-2 px-3 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Certificate identification number"
                maxLength={constants.MAX_SHORT_TEXT_LENGTH}
              />
            </div>

            <div>
              <label htmlFor="durationOfTrainingInWeeks" className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                Duration (weeks)
              </label>
              <input
                id="durationOfTrainingInWeeks"
                type="number"
                min="0"
                value={newCertification.durationOfTrainingInWeeks || ""}
                onChange={(e) => setNewCertification((prev) => ({ ...prev, durationOfTrainingInWeeks: parseInt(e.target.value) || 0 }))}
                className="w-full rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 py-2 px-3 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Duration of training program"
              />
            </div>

            <div>
              <label htmlFor="certificationScore" className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                Score/Grade
              </label>
              <input
                id="certificationScore"
                type="number"
                min="0"
                step="0.1"
                value={newCertification.certificationScore || ""}
                onChange={(e) => setNewCertification((prev) => ({ ...prev, certificationScore: parseFloat(e.target.value) || 0 }))}
                className="w-full rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 py-2 px-3 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Your score/grade if applicable"
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="certificateFileUrl" className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                Certificate File URL
              </label>
              <input
                id="certificateFileUrl"
                type="url"
                value={newCertification.certificateFileUrl || ""}
                onChange={(e) => setNewCertification((prev) => ({ ...prev, certificateFileUrl: e.target.value }))}
                className={`w-full rounded-lg border ${errors.certification?.certificateFileUrl ? "border-red-500" : "border-stone-300 dark:border-stone-700"} bg-stone-50 dark:bg-stone-800 py-2 px-3 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                placeholder="URL to view/download certificate"
                aria-invalid={!!errors.certification?.certificateFileUrl}
                aria-describedby="cert-url-error"
              />
              {errors.certification?.certificateFileUrl && (
                <p id="cert-url-error" className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                  <PiWarning size={16} /> {errors.certification.certificateFileUrl}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="issuedDate" className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                Issued Date*
              </label>
              <input
                id="issuedDate"
                type="date"
                required={!instructorDetails.certifications.length}
                value={newCertification.issuedDate.toISOString().split("T")[0]}
                onChange={handleCertificationIssuedDate}
                className={`w-full rounded-lg border ${errors.certification?.issuedDate ? "border-red-500" : "border-stone-300 dark:border-stone-700"} bg-stone-50 dark:bg-stone-800 py-2 px-3 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                aria-invalid={!!errors.certification?.issuedDate}
                aria-describedby="cert-date-error"
              />
              {errors.certification?.issuedDate && (
                <p id="cert-date-error" className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                  <PiWarning size={16} /> {errors.certification.issuedDate}
                </p>
              )}
            </div>

            <div className="md:col-span-2">
              <label htmlFor="specialMessage" className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                Special Message
              </label>
              <textarea
                id="specialMessage"
                value={newCertification.specialMessage || ""}
                onChange={(e) => setNewCertification((prev) => ({ ...prev, specialMessage: e.target.value }))}
                className="w-full rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 py-2 px-3 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent min-h-[80px]"
                placeholder="Any special message or note about this certification"
                maxLength={constants.MAX_TEXT_LENGTH}
              />
              <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
                {newCertification.specialMessage?.length || 0}/{constants.MAX_TEXT_LENGTH} characters
              </p>
            </div>
          </div>

          <button
            className="mt-4 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
            onClick={handleAddCertification}
            disabled={!newCertification.recipientName || !newCertification.certificationTitle || !newCertification.issuedOrganization || !newCertification.issuedDate}
            aria-label="Add certification"
          >
            Add Certification
          </button>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium text-stone-700 dark:text-stone-300 flex items-center gap-2">
            <PiBookOpenText size={20} />
            Your Certifications ({instructorDetails.certifications.length})
          </h3>

          {instructorDetails.certifications.length ? (
            <div className="space-y-3">
              {instructorDetails.certifications.map((cert, index) => (
                <div key={index} className="bg-stone-100 dark:bg-stone-700/50 p-4 rounded-lg border border-stone-200 dark:border-stone-600">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-orange-600 dark:text-orange-500">{cert.certificationTitle}</h4>
                      <p className="text-stone-600 dark:text-stone-300">
                        <span className="font-medium">Issued by:</span> {cert.issuedOrganization}
                      </p>
                      <p className="text-stone-600 dark:text-stone-300">
                        <span className="font-medium">Recipient:</span> {cert.recipientName}
                      </p>
                      <p className="text-sm text-stone-500 dark:text-stone-400">
                        <span className="font-medium">Issued:</span> {cert.issuedDate.toLocaleDateString()}
                        {cert.durationOfTrainingInWeeks ? ` • ${cert.durationOfTrainingInWeeks} weeks` : ""}
                        {cert.certificationScore ? ` • Score: ${cert.certificationScore}` : ""}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveCertification(index)}
                      className="text-stone-500 dark:text-stone-400 hover:text-red-500 dark:hover:text-red-400"
                      aria-label={`Remove ${cert.certificationTitle} certification`}
                    >
                      <PiTrash size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-stone-500 dark:text-stone-400">No certifications added yet</p>
          )}
        </div>
      </div>
    ),
    [newCertification, instructorDetails.certifications, errors, handleAddCertification, handleRemoveCertification, handleCertificationIssuedDate]
  );
  // Experience Tab
  const ExperienceTab = useMemo(
    () => (
      <div className="space-y-6">
        <div className=" p-4 rounded-lg">
          <h3 className="text-lg font-medium text-stone-700 dark:text-stone-300 mb-4">Add New Experience</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                Role/Position*
              </label>
              <input
                id="role"
                type="text"
                value={newExperience.role || ""}
                onChange={(e) => setNewExperience((prev) => ({ ...prev, role: e.target.value }))}
                className={`w-full rounded-lg border ${errors.experience?.role ? "border-red-500" : "border-stone-300 dark:border-stone-700"} bg-stone-50 dark:bg-stone-800 py-2 px-3 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                placeholder="e.g., Senior Developer"
                required={activeTab === "exp" && !instructorDetails.experiences.length}
                maxLength={constants.MAX_SHORT_TEXT_LENGTH}
                aria-invalid={!!errors.experience?.role}
                aria-describedby="exp-role-error"
              />
              {errors.experience?.role && (
                <p id="exp-role-error" className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                  <PiWarning size={16} /> {errors.experience.role}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="workedOrganization" className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                Organization*
              </label>
              <input
                id="workedOrganization"
                type="text"
                value={newExperience.workedOrganization || ""}
                onChange={(e) => setNewExperience((prev) => ({ ...prev, workedOrganization: e.target.value }))}
                className={`w-full rounded-lg border ${errors.experience?.workedOrganization ? "border-red-500" : "border-stone-300 dark:border-stone-700"} bg-stone-50 dark:bg-stone-800 py-2 px-3 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                placeholder="Company/organization name"
                required={activeTab === "exp" && !instructorDetails.experiences.length}
                maxLength={constants.MAX_SHORT_TEXT_LENGTH}
                aria-invalid={!!errors.experience?.workedOrganization}
                aria-describedby="exp-org-error"
              />
              {errors.experience?.workedOrganization && (
                <p id="exp-org-error" className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                  <PiWarning size={16} /> {errors.experience.workedOrganization}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="organizationJoiningDate" className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                Start Date*
              </label>
              <input
                id="organizationJoiningDate"
                type="date"
                value={newExperience.organizationJoiningDate?.toISOString().split("T")[0] || ""}
                onChange={handleExperienceStartDate}
                className={`w-full rounded-lg border ${errors.experience?.organizationJoiningDate ? "border-red-500" : "border-stone-300 dark:border-stone-700"} bg-stone-50 dark:bg-stone-800 py-2 px-3 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                required={activeTab === "exp" && !instructorDetails.experiences.length}
                aria-invalid={!!errors.experience?.organizationJoiningDate}
                aria-describedby="exp-start-error"
              />
              {errors.experience?.organizationJoiningDate && (
                <p id="exp-start-error" className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                  <PiWarning size={16} /> {errors.experience.organizationJoiningDate}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="organizationLeaveDate" className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                End Date
              </label>
              <input
                id="organizationLeaveDate"
                type="date"
                value={newExperience.organizationLeaveDate?.toISOString().split("T")[0] || ""}
                onChange={handleExperienceEndDate}
                className={`w-full rounded-lg border ${errors.experience?.organizationLeaveDate ? "border-red-500" : "border-stone-300 dark:border-stone-700"} bg-stone-50 dark:bg-stone-800 py-2 px-3 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                aria-invalid={!!errors.experience?.organizationLeaveDate}
                aria-describedby="exp-end-error"
                required={activeTab === "exp" && !instructorDetails.experiences.length}
              />
              {errors.experience?.organizationLeaveDate && (
                <p id="exp-end-error" className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                  <PiWarning size={16} /> {errors.experience.organizationLeaveDate}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="workDurationInMonths" className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                Duration (months)
              </label>
              <input
                id="workDurationInMonths"
                type="number"
                min="0"
                required={activeTab === "exp" && !instructorDetails.experiences.length}
                value={newExperience.workDurationInMonths || ""}
                onChange={(e) => setNewExperience((prev) => ({ ...prev, workDurationInMonths: parseInt(e.target.value) || 0 }))}
                className="w-full rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 py-2 px-3 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Duration in months"
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="workDescription" className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                Description*
              </label>
              <textarea
                id="workDescription"
                value={newExperience.workDescription || ""}
                onChange={(e) => setNewExperience((prev) => ({ ...prev, workDescription: e.target.value }))}
                className={`w-full rounded-lg border ${errors.experience?.workDescription ? "border-red-500" : "border-stone-300 dark:border-stone-700"} bg-stone-50 dark:bg-stone-800 py-2 px-3 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent min-h-[100px]`}
                placeholder="Describe your role and responsibilities"
                required={activeTab === "exp" && !instructorDetails.experiences.length}
                maxLength={constants.MAX_TEXT_LENGTH}
                aria-invalid={!!errors.experience?.workDescription}
                aria-describedby="exp-desc-error"
              />
              {errors.experience?.workDescription && (
                <p id="exp-desc-error" className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                  <PiWarning size={16} /> {errors.experience.workDescription}
                </p>
              )}
              <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
                {newExperience.workDescription?.length || 0}/{constants.MAX_TEXT_LENGTH} characters
              </p>
            </div>
          </div>

          <button
            className="mt-4 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
            onClick={handleAddExperience}
            disabled={!newExperience.role || !newExperience.workedOrganization || !newExperience.organizationJoiningDate || !newExperience.workDescription}
            aria-label="Add experience"
          >
            Add Experience
          </button>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium text-stone-700 dark:text-stone-300 flex items-center gap-2">
            <PiBookOpenText size={20} />
            Your Experiences ({instructorDetails.experiences.length})
          </h3>

          {instructorDetails.experiences.length ? (
            <div className="space-y-3">
              {instructorDetails.experiences.map((exp, index) => (
                <div key={index} className="bg-stone-100 dark:bg-stone-700/50 p-4 rounded-lg border border-stone-200 dark:border-stone-600">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-orange-600 dark:text-orange-500">{exp.role}</h4>
                      <p className="text-stone-600 dark:text-stone-300">
                        <span className="font-medium">Organization:</span> {exp.workedOrganization}
                      </p>
                      <p className="text-stone-600 dark:text-stone-300">
                        <span className="font-medium">Duration:</span> {exp.workDurationInMonths} months
                      </p>
                      <p className="text-sm text-stone-500 dark:text-stone-400">
                        {exp.organizationJoiningDate.toLocaleDateString()} - {exp.organizationLeaveDate.toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveExperience(index)}
                      className="text-stone-500 dark:text-stone-400 hover:text-red-500 dark:hover:text-red-400"
                      aria-label={`Remove ${exp.role} experience`}
                    >
                      <PiTrash size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-stone-500 dark:text-stone-400">No experiences added yet</p>
          )}
        </div>
      </div>
    ),
    [newExperience, instructorDetails.experiences, errors, handleAddExperience, handleRemoveExperience, handleExperienceStartDate, handleExperienceEndDate]
  );

  return (
    <>
      <Head>
        <title>Create Instructor Profile | YourPlatformName</title>
        <meta name="description" content="Create your professional instructor profile to start teaching on our platform. Add your credentials, experience, and certifications." />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://yourplatform.com/create-profile" />
        <meta property="og:title" content="Create Instructor Profile | YourPlatformName" />
        <meta property="og:description" content="Build your professional instructor profile to start teaching on our platform." />
        <meta property="og:image" content="https://yourplatform.com/images/instructor-profile-og.jpg" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="https://yourplatform.com/create-profile" />
        <meta name="twitter:title" content="Create Instructor Profile | YourPlatformName" />
        <meta name="twitter:description" content="Build your professional instructor profile to start teaching on our platform." />
        <meta name="twitter:image" content="https://yourplatform.com/images/instructor-profile-twitter.jpg" />

        {/* Canonical URL */}
        <link rel="canonical" href="https://yourplatform.com/create-profile" />

        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "Create Instructor Profile",
            "description": "Page for creating an instructor profile on our platform",
            "url": "https://yourplatform.com/create-profile",
            "potentialAction": {
              "@type": "CreateAction",
              "target": "https://yourplatform.com/api/admin/create-profile",
              "description": "Create an instructor profile"
            }
          })}
        </script>
      </Head>
      <main className="min-h-screen py-8 flex items-center justify-center bg-gradient-to-br from-orange-200 via-orange-300 to-orange-400 dark:from-stone-800 dark:via-stone-900 dark:to-black">
        <form onSubmit={handleSubmitForm} className="w-full max-w-5xl">
          <div className="mb-8">
            <h1 className="text-orange-600 dark:text-orange-500 text-2xl font-bold">Create Your Profile</h1>
            <p className="text-stone-600 dark:text-stone-300">Build your professional identity by adding your credentials and experience</p>
          </div>

          <div className="flex border-b border-stone-200 dark:border-stone-700 mb-6" role="tablist">
            <button
              type="button"
              onClick={() => setActiveTab("basic")}
              className={`px-4 py-2 font-medium ${activeTab === "basic" ? "text-orange-600 dark:text-orange-500 border-b-2 border-orange-600 dark:border-orange-500" : "text-stone-600 dark:text-stone-400 hover:text-orange-500 dark:hover:text-orange-400"}`}
              role="tab"
              aria-selected={activeTab === "basic"}
              aria-controls="basic-tabpanel"
            >
              Basic Info
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("certs")}
              className={`px-4 py-2 font-medium ${activeTab === "certs" ? "text-orange-600 dark:text-orange-500 border-b-2 border-orange-600 dark:border-orange-500" : "text-stone-600 dark:text-stone-400 hover:text-orange-500 dark:hover:text-orange-400"}`}
              role="tab"
              aria-selected={activeTab === "certs"}
              aria-controls="certs-tabpanel"
            >
              Certifications ({instructorDetails.certifications.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("exp")}
              className={`px-4 py-2 font-medium ${activeTab === "exp" ? "text-orange-600 dark:text-orange-500 border-b-2 border-orange-600 dark:border-orange-500" : "text-stone-600 dark:text-stone-400 hover:text-orange-500 dark:hover:text-orange-400"}`}
              role="tab"
              aria-selected={activeTab === "exp"}
              aria-controls="exp-tabpanel"
            >
              Experience ({instructorDetails.experiences.length})
            </button>
          </div>

          <div role="tabpanel" id="basic-tabpanel" aria-labelledby="basic-tab" hidden={activeTab !== "basic"}>
            {BasicInfoTab}
          </div>
          <div role="tabpanel" id="certs-tabpanel" aria-labelledby="certs-tab" hidden={activeTab !== "certs"}>
            {CertificationsTab}
          </div>
          <div role="tabpanel" id="exp-tabpanel" aria-labelledby="exp-tab" hidden={activeTab !== "exp"}>
            {ExperienceTab}
          </div>

          <div className="mt-8 flex justify-between items-center">
            {submitStatus === "success" && (
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <PiCheck size={20} />
                <span>Profile saved successfully!</span>
              </div>
            )}
            {submitStatus === "error" && (
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <PiWarning size={20} />
                <span>Please fix the errors before submitting</span>
              </div>
            )}
            <button
              type="submit"
              // disabled={submitStatus === "submitting"}
              className="px-6 py-3 rounded-lg bg-orange-600 text-white hover:bg-orange-700 transition-colors font-medium disabled:opacity-50 ml-auto"
              aria-label="Complete Profile"
            >
              {submitStatus === "submitting" ? "Saving..." : "Complete Profile"}
            </button>
          </div>
        </form>
      </main>
    </>
  );
}//The End Of Code Almost Fully Optimised