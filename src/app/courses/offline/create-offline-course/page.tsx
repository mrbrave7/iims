"use client";
import React, { FormEvent, useCallback, useState, useMemo, useEffect } from "react";
import DOMPurify from "dompurify";
import { usePopupContext } from "@/app/Context/ToastProvider";
import DetailsTab from "./Tabs/CourseDetails";
import { PricingAndOfferTab } from "./Tabs/Pricing&Offers";
import { SEOAndMarketingTab } from "./Tabs/SEO&Marketing";
import { AdditionalFeaturesTab } from "./Tabs/AdditionalFeatures";
import BatchTab from "./Tabs/Batches";
import Head from "next/head";

// Interfaces for type safety
interface OfflineCourseDetails {
  courseName: string;
  courseGoals: string[];
  courseLevel: "Beginner" | "Intermediate" | "Advanced";
  courseDescription: string;
  courseDurationInDays: number;
  courseDailyClassDurationInMinutes: number;
  syllabusOutline: string[];
}

interface DetailsErrors {
  courseName: string;
  courseGoals: string;
  courseLevel: string;
  courseDescription: string;
  courseDurationInDays: string;
  courseDailyClassDurationInMinutes: string;
  syllabusOutline: string;
}

interface PaymentPlan {
  planName: string;
  amount: number;
  duration: string;
}

interface Offer_Details {
  offerCode: string;
  offerDescription: string;
  offerSlogan: string;
  discountPercentage: number;
  offerValidity: Date;
  offerSeatsAvailable: number;
}

interface OfflineCoursePricingAndOffer {
  currency: string;
  courseFeeStructure: number;
  paymentPlans: PaymentPlan[];
  isCourseOnOffer: boolean;
  offerDetail?: Offer_Details;
}

interface PricingAndOfferError {
  courseFeeStructure: string;
  currency: string;
  isCourseOnOffer: string;
  offerDetail: string;
  paymentPlans: string;
}

interface OfferError {
  discountPercentage: string;
  offerCode: string;
  offerDescription: string;
  offerSeatsAvailable: string;
  offerSlogan: string;
  offerValidity: string;
}

interface PaymentPlanError {
  amount: string;
  duration: string;
  planName: string;
}

interface OfflineCourseSEOAndMarketing {
  seoMetaTitle: string;
  seoMetaDescription: string;
  promoVideoUrl: string;
  courseBannerUrl: string;
  tags: string[];
}

interface OfflineCourseCategory {
  courseCategory: string;
  courseSubCategory: string;
  trendingScore: number;
}

interface SEOAndMarketingError {
  courseBannerUrl: string;
  promoVideoUrl: string;
  seoMetaTitle: string;
  seoMetaDescription: string;
  tags: string;
}

interface CategoryError {
  courseCategory: string;
  courseSubCategory: string;
  trendingScore: string;
}

interface FAQ {
  question: string;
  answer: string;
}

interface ContactDetails {
  email: string;
  phone: string;
}

interface RefundPolicy {
  isRefundable: boolean;
  refundPeriodDays: number;
  conditions: string;
}

interface OfflineCourseAdditionalFeatures {
  faqs: FAQ[];
  refundPolicy: RefundPolicy;
  targetAudience: string[];
  availableLanguages: string[];
  materialsProvided: string[];
  equipmentRequired: string[];
  accessibilityFeatures: string[];
  contactDetails: ContactDetails;
  termsAndCondition: string;
}

interface AdditionalFeaturesErrors {
  faqs: string;
  availableLanguages: string;
  targetedAudience: string;
  materialProvided: string;
  equipmentRequired: string;
  accessibilityFeatures: string;
  contactDetails: string;
  termsAndCondition: string
}

interface ContactDetailsError {
  email: string;
  phone: string;
}

interface RefundPolicyError {
  refundPeriodDays: string;
  conditions: string;
}

interface FAQErrors {
  question: string;
  answer: string;
}

interface Batch_Instructor {
  id: string;
  profile_details: {
    id: string;
    avatarUrl: string;
    fullName: string;
  };
}

interface BatchDetails {
  batchName: string;
  batchInstructors: Batch_Instructor[];
  batchStartDate: string;
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

interface OfflineCourseModel {
  course: OfflineCourseDetails;
  courseCategories: OfflineCourseCategory;
  courseSEOAndMarketing: OfflineCourseSEOAndMarketing;
  coursePricingAndOffers: OfflineCoursePricingAndOffer;
  courseAdditionalFeatures: OfflineCourseAdditionalFeatures;
  batches: BatchDetails[]; // Updated to array
}

// Constants
export const worldCurrencies = [
  "USD", "EUR", "JPY", "GBP", "AUD", "CAD", "CHF", "CNY", "INR", "NPR", "NZD",
  "SGD", "HKD", "KRW", "ZAR", "BRL", "MXN", "RUB", "SEK", "NOK", "DKK", "AED",
  "ARS", "CLP", "EGP", "ILS", "MYR", "PHP", "SAR", "THB", "TRY",
];

const LOCAL_STORAGE_KEY = "offline_course_form_data";

// Utility Functions
export const isValidUrl = (url: string): boolean => {
  try {
    const trimmedUrl = url.trim();
    if (!trimmedUrl) return false;
    const parsedUrl = new URL(trimmedUrl);
    return parsedUrl.protocol === "https:";
  } catch {
    return false;
  }
};

// Debounce function to optimize localStorage writes
const debounce = (func: (...args: any[]) => void, wait: number) => {
  let timeout: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export default function CreateOfflineCourse(): React.ReactElement {
  const { Popup } = usePopupContext();
  const toast = Popup();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const tabs = ["Details", "Pricing & Offers", "SEO & Marketing", "Additional Features", "Batch"];
  const [selectedTab, setSelectedTab] = useState<string>("Details");

  // Form State
  const [details, setDetails] = useState<OfflineCourseDetails>({
    courseName: "",
    courseGoals: [],
    courseLevel: "Beginner",
    courseDescription: "",
    courseDurationInDays: 0,
    courseDailyClassDurationInMinutes: 0,
    syllabusOutline: [],
  });

  const [detailsErrors, setDetailsErrors] = useState<DetailsErrors>({
    courseName: "",
    courseGoals: "",
    courseLevel: "",
    courseDescription: "",
    courseDurationInDays: "",
    courseDailyClassDurationInMinutes: "",
    syllabusOutline: "",
  });

  const [singleSyllabusOutline, setSingleSyllabusOutline] = useState<string>("");
  const [singleCourseGoals, setSingleCourseGoals] = useState<string>("");

  const [pricingAndOffers, setPricingAndOffers] = useState<OfflineCoursePricingAndOffer>({
    currency: "",
    courseFeeStructure: 0,
    paymentPlans: [],
    isCourseOnOffer: false,
    offerDetail: {
      offerCode: "",
      offerDescription: "",
      offerSlogan: "",
      discountPercentage: 0,
      offerValidity: new Date(),
      offerSeatsAvailable: 0,
    },
  });

  const [pricingAndOffersErrors, setPricingAndOffersErrors] = useState<PricingAndOfferError>({
    courseFeeStructure: "",
    currency: "",
    isCourseOnOffer: "",
    offerDetail: "",
    paymentPlans: "",
  });

  const [newPaymentPlan, setNewPaymentPlan] = useState<PaymentPlan>({
    amount: 0,
    duration: "",
    planName: "",
  });

  const [paymentPlanError, setPaymentPlanError] = useState<PaymentPlanError>({
    amount: "",
    duration: "",
    planName: "",
  });

  const [offerDetails, setOfferDetails] = useState<Offer_Details>(pricingAndOffers.offerDetail!);

  const [offerError, setOfferError] = useState<OfferError>({
    discountPercentage: "",
    offerCode: "",
    offerDescription: "",
    offerSeatsAvailable: "",
    offerSlogan: "",
    offerValidity: "",
  });

  const [seoAndMarketingData, setSeoAndMarketingData] = useState<
    OfflineCourseSEOAndMarketing & OfflineCourseCategory
  >({
    courseBannerUrl: "",
    promoVideoUrl: "",
    seoMetaDescription: "",
    seoMetaTitle: "",
    tags: [],
    courseCategory: "",
    courseSubCategory: "",
    trendingScore: 0,
  });

  const [seoAndMarketingError, setSeoAndMarketingError] = useState<SEOAndMarketingError>({
    courseBannerUrl: "",
    promoVideoUrl: "",
    seoMetaDescription: "",
    seoMetaTitle: "",
    tags: "",
  });

  const [categoryError, setCategoryError] = useState<CategoryError>({
    courseCategory: "",
    courseSubCategory: "",
    trendingScore: "",
  });

  const [singleTagField, setSingleTagField] = useState<string>("");

  const [additionalFeatures, setAdditionalFeatures] = useState<OfflineCourseAdditionalFeatures>({
    faqs: [],
    refundPolicy: { isRefundable: false, refundPeriodDays: 0, conditions: "" },
    targetAudience: [],
    availableLanguages: [],
    materialsProvided: [],
    equipmentRequired: [],
    accessibilityFeatures: [],
    contactDetails: { phone: "", email: "" },
    termsAndCondition: ""
  });

  const [additionalFeaturesErrors, setAdditionalFeaturesErrors] = useState<AdditionalFeaturesErrors>({
    faqs: "",
    availableLanguages: "",
    targetedAudience: "",
    materialProvided: "",
    equipmentRequired: "",
    accessibilityFeatures: "",
    contactDetails: "",
    termsAndCondition: ""
  });

  const [contactDetailsError, setContactDetailsError] = useState<ContactDetailsError>({
    email: "",
    phone: "",
  });

  const [refundPolicyError, setRefundPolicyError] = useState<RefundPolicyError>({
    refundPeriodDays: "",
    conditions: "",
  });

  const [faqErrors, setFaqErrors] = useState<FAQErrors>({
    question: "",
    answer: "",
  });

  const [singleTargetAudience, setSingleTargetAudience] = useState<string>("");
  const [language, setLanguage] = useState<string>("");
  const [providedMaterials, setProvidedMaterials] = useState<string>("");
  const [requiredEquipments, setRequiredEquipments] = useState<string>("");
  const [accessibilityFeaturesInput, setAccessibilityFeaturesInput] = useState<string>("");
  const [faqs, setFaqs] = useState<FAQ>({ question: "", answer: "" });

  const [batches, setBatches] = useState<BatchDetails[]>([]);
  const [batchDetails, setBatchDetails] = useState<BatchDetails>({
    batchName: "",
    batchInstructors: [],
    batchStartDate: "",
    maxStudentCount: 0,
    enrollmentStartDate: "",
    enrollmentEndDate: "",
    address: {
      street: "",
      city: "",
      state: "",
      country: "",
      zipCode: "",
    },
  });

  const [batchErrors, setBatchErrors] = useState<BatchErrors>({
    batchName: "",
    batchInstructors: "",
    batchStartDate: "",
    maxStudentCount: "",
    enrollmentStartDate: "",
    enrollmentEndDate: "",
    address: {
      street: "",
      city: "",
      state: "",
      country: "",
      zipCode: "",
    },
  });
  const handleTermsAndCondition = (value: string) => {
    setAdditionalFeatures((prev) => ({ ...prev, termsAndCondition: value }))
  }
  // Sanitization
  const sanitizeInput = useCallback((value: string) => DOMPurify.sanitize(value), []);

  // Validation Functions
  const validateDetails = useCallback((): boolean => {
    const errors: DetailsErrors = {
      courseName: details.courseName.trim() && details.courseName.length <= 500 ? "" : "Course name is required and must be ≤ 500 characters",
      courseGoals: details.courseGoals.length > 0 ? "" : "At least one goal is required",
      courseLevel: details.courseLevel ? "" : "Course level is required",
      courseDescription: details.courseDescription.trim() && details.courseDescription.length <= 1000 ? "" : "Description is required and must be ≤ 1000 characters",
      courseDurationInDays: details.courseDurationInDays > 0 && details.courseDurationInDays <= 365 ? "" : "Duration must be 1–365 days",
      courseDailyClassDurationInMinutes: details.courseDailyClassDurationInMinutes > 0 && details.courseDailyClassDurationInMinutes <= 600 ? "" : "Daily duration must be 1–600 minutes",
      syllabusOutline: details.syllabusOutline.length > 0 ? "" : "At least one outline is required",
    };
    setDetailsErrors(errors);
    return Object.values(errors).every((error) => !error);
  }, [details]);

  const validatePricingAndOffers = useCallback((): boolean => {
    const errors: PricingAndOfferError = {
      courseFeeStructure: pricingAndOffers.courseFeeStructure > 0 ? "" : "Course fee is required",
      currency: worldCurrencies.includes(pricingAndOffers.currency) ? "" : "Valid currency is required",
      isCourseOnOffer: "",
      offerDetail: "",
      paymentPlans: pricingAndOffers.paymentPlans.length > 0 ? "" : "At least one payment plan is required",
    };

    if (pricingAndOffers.isCourseOnOffer) {
      const offerErrors: OfferError = {
        offerSlogan: offerDetails.offerSlogan.trim() && offerDetails.offerSlogan.length <= 100 ? "" : "Offer slogan is required and must be ≤ 100 characters",
        offerCode: offerDetails.offerCode.trim() && /^[A-Z0-9]{6,10}$/.test(offerDetails.offerCode) ? "" : "Offer code must be 6–10 alphanumeric characters",
        discountPercentage: offerDetails.discountPercentage > 0 && offerDetails.discountPercentage <= 100 ? "" : "Discount must be 1–100%",
        offerSeatsAvailable: offerDetails.offerSeatsAvailable > 0 && offerDetails.offerSeatsAvailable <= 1000 ? "" : "Seats must be 1–1000",
        offerDescription: offerDetails.offerDescription.trim() && offerDetails.offerDescription.length >= 10 && offerDetails.offerDescription.length <= 500 ? "" : "Description must be 10–500 characters",
        offerValidity: new Date(offerDetails.offerValidity) > new Date() ? "" : "Offer validity must be a future date",
      };
      setOfferError(offerErrors);
      if (Object.values(offerErrors).some((error) => error)) {
        errors.offerDetail = "Please fix offer details errors";
      }
    }

    setPricingAndOffersErrors(errors);
    return Object.values(errors).every((error) => !error);
  }, [pricingAndOffers, offerDetails]);

  const validateSEOAndMarketing = useCallback((): boolean => {
    const errors: SEOAndMarketingError = {
      courseBannerUrl: seoAndMarketingData.courseBannerUrl.trim() && isValidUrl(seoAndMarketingData.courseBannerUrl) ? "" : "Valid HTTPS banner URL is required",
      promoVideoUrl: seoAndMarketingData.promoVideoUrl.trim() && isValidUrl(seoAndMarketingData.promoVideoUrl) ? "" : "Valid HTTPS video URL is required",
      seoMetaTitle: seoAndMarketingData.seoMetaTitle.trim() && seoAndMarketingData.seoMetaTitle.length >= 10 && seoAndMarketingData.seoMetaTitle.length <= 60 ? "" : "SEO meta title must be 10–60 characters",
      seoMetaDescription: seoAndMarketingData.seoMetaDescription.trim() && seoAndMarketingData.seoMetaDescription.length >= 50 && seoAndMarketingData.seoMetaDescription.length <= 160 ? "" : "SEO meta description must be 50–160 characters",
      tags: seoAndMarketingData.tags.length > 0 && seoAndMarketingData.tags.length <= 10 ? "" : "1–10 tags are required",
    };
    const categoryErrors: CategoryError = {
      courseCategory: seoAndMarketingData.courseCategory.trim() && seoAndMarketingData.courseCategory.length <= 50 ? "" : "Category is required and must be ≤ 50 characters",
      courseSubCategory: seoAndMarketingData.courseSubCategory.trim() && seoAndMarketingData.courseSubCategory.length <= 50 ? "" : "Sub-category is required and must be ≤ 50 characters",
      trendingScore: seoAndMarketingData.trendingScore >= 0 && seoAndMarketingData.trendingScore <= 500 ? "" : "Trending score must be 0–500",
    };
    setSeoAndMarketingError(errors);
    setCategoryError(categoryErrors);
    return Object.values(errors).every((error) => !error) && Object.values(categoryErrors).every((error) => !error);
  }, [seoAndMarketingData]);

  const validateAdditionalFeatures = useCallback((): boolean => {
    const errors: AdditionalFeaturesErrors = {
      faqs: additionalFeatures.faqs.length > 0 ? "" : "At least one FAQ is required",
      availableLanguages: additionalFeatures.availableLanguages.length > 0 ? "" : "At least one language is required",
      targetedAudience: additionalFeatures.targetAudience.length > 0 ? "" : "At least one target audience is required",
      materialProvided: additionalFeatures.materialsProvided.length === 0 || additionalFeatures.materialsProvided.every((m) => m.trim()) ? "" : "Materials cannot be empty",
      equipmentRequired: additionalFeatures.equipmentRequired.length === 0 || additionalFeatures.equipmentRequired.every((e) => e.trim()) ? "" : "Equipment cannot be empty",
      accessibilityFeatures: additionalFeatures.accessibilityFeatures.length === 0 || additionalFeatures.accessibilityFeatures.every((f) => f.trim()) ? "" : "Features cannot be empty",
      contactDetails: "",
      termsAndCondition: additionalFeatures.termsAndCondition.trim() && additionalFeatures.termsAndCondition.length >= 100 && additionalFeatures.termsAndCondition.length <= 5000 ? "" : "Batch name must be 100–5000 characters"
    };

    const contactErrors: ContactDetailsError = {
      email: additionalFeatures.contactDetails.email.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(additionalFeatures.contactDetails.email) ? "" : "Valid email is required",
      phone: additionalFeatures.contactDetails.phone.trim() && /^\+?\d{7,15}$/.test(additionalFeatures.contactDetails.phone) ? "" : "Valid phone number (7–15 digits) is required",
    };

    const refundErrors: RefundPolicyError = {
      refundPeriodDays: !additionalFeatures.refundPolicy.isRefundable || (additionalFeatures.refundPolicy.refundPeriodDays > 0 && additionalFeatures.refundPolicy.refundPeriodDays <= 30) ? "" : "Refund period must be 1–30 days",
      conditions: !additionalFeatures.refundPolicy.isRefundable || (additionalFeatures.refundPolicy.conditions.trim() && additionalFeatures.refundPolicy.conditions.length <= 500) ? "" : "Conditions are required and must be ≤ 500 characters",
    };

    setAdditionalFeaturesErrors(errors);
    setContactDetailsError(contactErrors);
    setRefundPolicyError(refundErrors);

    return (
      Object.values(errors).every((error) => !error) &&
      Object.values(contactErrors).every((error) => !error) &&
      Object.values(refundErrors).every((error) => !error)
    );
  }, [additionalFeatures]);

  const validateBatch = useCallback((): boolean => {
    const errors: BatchErrors = {
      batchName: batchDetails.batchName.trim() && batchDetails.batchName.length >= 3 && batchDetails.batchName.length <= 50 ? "" : "Batch name must be 3–50 characters",
      batchInstructors: batchDetails.batchInstructors.length > 0 ? "" : "At least one instructor is required",
      batchStartDate: batchDetails.batchStartDate && new Date(batchDetails.batchStartDate) > new Date() ? "" : "Batch start date must be in the future",
      maxStudentCount: batchDetails.maxStudentCount >= 1 && batchDetails.maxStudentCount <= 1000 ? "" : "Student count must be 1–1000",
      enrollmentStartDate: batchDetails.enrollmentStartDate && new Date(batchDetails.enrollmentStartDate) <= new Date(batchDetails.batchStartDate) ? "" : "Enrollment start date must be before batch start",
      enrollmentEndDate: batchDetails.enrollmentEndDate && new Date(batchDetails.enrollmentEndDate) > new Date(batchDetails.enrollmentStartDate) && new Date(batchDetails.enrollmentEndDate) <= new Date(batchDetails.batchStartDate) ? "" : "Enrollment end date must be after start date and before batch start",
      address: {
        street: batchDetails.address.street.trim() && batchDetails.address.street.length <= 100 ? "" : "Street is required and must be ≤ 100 characters",
        city: batchDetails.address.city.trim() && batchDetails.address.city.length <= 50 ? "" : "City is required and must be ≤ 50 characters",
        state: batchDetails.address.state.trim() && batchDetails.address.state.length <= 50 ? "" : "State is required and must be ≤ 50 characters",
        country: batchDetails.address.country.trim() && batchDetails.address.country.length <= 50 ? "" : "Country is required and must be ≤ 50 characters",
        zipCode: batchDetails.address.zipCode.trim() && /^[0-9]{5}(-[0-9]{4})?$/.test(batchDetails.address.zipCode) ? "" : "Valid zip code is required (e.g., 12345 or 12345-6789)",
      },

    };

    setBatchErrors(errors);
    const hasErrors =
      Object.values(errors).some((error) => typeof error === "string" && error) ||
      Object.values(errors.address).some((error) => error);

    if (hasErrors) {
      toast.error("Please fix batch errors");
    }
    return !hasErrors;
  }, [batchDetails, toast]);

  // Batch Handlers
  const handleAddBatches = useCallback(() => {

    if (validateBatch()) {
      setBatches((prev) => [...prev, { ...batchDetails }]);
      setBatchDetails({
        batchName: "",
        batchInstructors: [],
        batchStartDate: "",
        maxStudentCount: 0,
        enrollmentStartDate: "",
        enrollmentEndDate: "",
        address: {
          street: "",
          city: "",
          state: "",
          country: "",
          zipCode: "",
        },
      });
      setBatchErrors({
        batchName: "",
        batchInstructors: "",
        batchStartDate: "",
        maxStudentCount: "",
        enrollmentStartDate: "",
        enrollmentEndDate: "",
        address: {
          street: "",
          city: "",
          state: "",
          country: "",
          zipCode: "",
        },
      });
      toast.success("Batch added successfully");
    }
  }, [batchDetails, validateBatch, toast]);

  const handleRemoveBatches = useCallback((index: number) => {
    setBatches((prev) => prev.filter((_, i) => i !== index));
    toast.warning("Batch removed");
  }, [toast]);

  const handleBatchChange = useCallback(
    (name: keyof BatchDetails, value: any) => {
      const sanitizedValue = typeof value === "string" ? sanitizeInput(value) : value;
      setBatchDetails((prev) => ({ ...prev, [name]: sanitizedValue }));
      setBatchErrors((prev) => ({ ...prev, [name]: "" }));
    },
    [sanitizeInput]
  );

  const handleAddressChange = useCallback(
    (name: keyof BatchDetails["address"], value: string) => {
      const sanitizedValue = sanitizeInput(value);
      setBatchDetails((prev) => ({
        ...prev,
        address: { ...prev.address, [name]: sanitizedValue },
      }));
      setBatchErrors((prev) => ({
        ...prev,
        address: { ...prev.address, [name]: "" },
      }));
    },
    [sanitizeInput]
  );

  const handleAddInstructor = useCallback(
    (instructor: Batch_Instructor) => {
      setBatchDetails((prev) => ({
        ...prev,
        batchInstructors: [...prev.batchInstructors, instructor],
      }));
      setBatchErrors((prev) => ({ ...prev, batchInstructors: "" }));
      toast.success("Instructor added");
    },
    [toast]
  );

  const handleRemoveInstructor = useCallback(
    (index: number) => {
      setBatchDetails((prev) => ({
        ...prev,
        batchInstructors: prev.batchInstructors.filter((_, i) => i !== index),
      }));
      toast.warning("Instructor removed");
    },
    [toast]
  );

  // Local Storage Persistence
  const formState = useMemo(
    () => ({
      details,
      pricingAndOffers,
      seoAndMarketingData,
      additionalFeatures,
      batches, // Added batches
      batchDetails,
      singleSyllabusOutline,
      singleCourseGoals,
      newPaymentPlan,
      offerDetails,
      singleTagField,
      singleTargetAudience,
      language,
      providedMaterials,
      requiredEquipments,
      accessibilityFeaturesInput,
      faqs,
      selectedTab,
    }),
    [
      details,
      pricingAndOffers,
      seoAndMarketingData,
      additionalFeatures,
      batches, // Added batches
      batchDetails,
      singleSyllabusOutline,
      singleCourseGoals,
      newPaymentPlan,
      offerDetails,
      singleTagField,
      singleTargetAudience,
      language,
      providedMaterials,
      requiredEquipments,
      accessibilityFeaturesInput,
      faqs,
      selectedTab,
    ]
  );

  // Debounced save to localStorage
  const saveToLocalStorage = useCallback(
    debounce(() => {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(formState));
      } catch (error) {
        if (error instanceof DOMException && error.name === "QuotaExceededError") {
          console.error("localStorage quota exceeded:", error);
          toast.error("Storage limit reached. Please submit or clear the form.");
        } else {
          console.error("Failed to save form data to localStorage:", error);
          toast.error("Failed to save form data. Please save manually.");
        }
      }
    }, 500),
    [formState]
  );

  // Save form state to localStorage
  useEffect(() => {
    saveToLocalStorage();
  }, [formState, saveToLocalStorage]);

  // Restore form state from localStorage on mount
  useEffect(() => {
    try {
      const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedData) {
        const parsedData = JSON.parse(savedData);

        setDetails(parsedData.details || {
          courseName: "",
          courseGoals: [],
          courseLevel: "Beginner",
          courseDescription: "",
          courseDurationInDays: 0,
          courseDailyClassDurationInMinutes: 0,
          syllabusOutline: [],
        });
        setPricingAndOffers(parsedData.pricingAndOffers || {
          currency: "",
          courseFeeStructure: 0,
          paymentPlans: [],
          isCourseOnOffer: false,
          offerDetail: {
            offerCode: "",
            offerDescription: "",
            offerSlogan: "",
            discountPercentage: 0,
            offerValidity: new Date(),
            offerSeatsAvailable: 0,
          },
        });
        setSeoAndMarketingData(parsedData.seoAndMarketingData || {
          courseBannerUrl: "",
          promoVideoUrl: "",
          seoMetaDescription: "",
          seoMetaTitle: "",
          tags: [],
          courseCategory: "",
          courseSubCategory: "",
          trendingScore: 0,
        });
        setAdditionalFeatures(parsedData.additionalFeatures || {
          faqs: [],
          refundPolicy: { isRefundable: false, refundPeriodDays: 0, conditions: "" },
          targetAudience: [],
          availableLanguages: [],
          materialsProvided: [],
          equipmentRequired: [],
          accessibilityFeatures: [],
          contactDetails: { phone: "", email: "" },
          termsAndCondition: ""
        });
        setBatches(parsedData.batches || []); // Added batches
        setBatchDetails(parsedData.batchDetails || {
          batchName: "",
          batchInstructors: [],
          batchTimingStart: "",
          maxStudentCount: 0,
          enrollmentStartDate: "",
          enrollmentEndDate: "",
          address: {
            street: "",
            city: "",
            state: "",
            country: "",
            zipCode: "",
          },
        });

        setSingleSyllabusOutline(parsedData.singleSyllabusOutline || "");
        setSingleCourseGoals(parsedData.singleCourseGoals || "");
        setNewPaymentPlan(parsedData.newPaymentPlan || { amount: 0, duration: "", planName: "" });
        setOfferDetails(parsedData.offerDetails || {
          offerCode: "",
          offerDescription: "",
          offerSlogan: "",
          discountPercentage: 0,
          offerValidity: new Date(),
          offerSeatsAvailable: 0,
        });
        setSingleTagField(parsedData.singleTagField || "");
        setSingleTargetAudience(parsedData.singleTargetAudience || "");
        setLanguage(parsedData.language || "");
        setProvidedMaterials(parsedData.providedMaterials || "");
        setRequiredEquipments(parsedData.requiredEquipments || "");
        setAccessibilityFeaturesInput(parsedData.accessibilityFeaturesInput || "");
        setFaqs(parsedData.faqs || { question: "", answer: "" });
        setSelectedTab(parsedData.selectedTab || "Details");

        toast.success("Restored saved form data.");
      }
    } catch (error) {
      console.error("Failed to restore form data from localStorage:", error);
      toast.error("Failed to restore saved form data.");
    }
  }, []);

  // Handlers for other tabs (unchanged for brevity)
  const handleDetailsChange = useCallback(
    (name: keyof OfflineCourseDetails, value: any) => {
      const sanitizedValue = typeof value === "string" ? sanitizeInput(value) : value;
      setDetails((prev) => ({ ...prev, [name]: sanitizedValue }));
      setDetailsErrors((prev) => ({ ...prev, [name]: "" }));
    },
    [sanitizeInput]
  );

  const handleSyllabusOutlineChange = useCallback(
    (value: string) => {
      setSingleSyllabusOutline(sanitizeInput(value));
    },
    [sanitizeInput]
  );

  const handleCourseGoalsChange = useCallback(
    (value: string) => {
      setSingleCourseGoals(sanitizeInput(value));
    },
    [sanitizeInput]
  );

  const handleAddSyllabusOutline = useCallback(
    (value: string) => {
      const sanitizedValue = sanitizeInput(value);
      if (!sanitizedValue || sanitizedValue.length > 200) {
        setDetailsErrors((prev) => ({ ...prev, syllabusOutline: "Syllabus outline is required and must be ≤ 200 characters" }));
        toast.error("Syllabus outline is required and must be ≤ 200 characters");
        return;
      }
      if (details.syllabusOutline.includes(sanitizedValue)) {
        setDetailsErrors((prev) => ({ ...prev, syllabusOutline: "Duplicate syllabus outline" }));
        toast.error("This syllabus outline already exists");
        return;
      }
      setDetails((prev) => ({ ...prev, syllabusOutline: [...prev.syllabusOutline, sanitizedValue] }));
      setSingleSyllabusOutline("");
      setDetailsErrors((prev) => ({ ...prev, syllabusOutline: "" }));
      toast.success("Syllabus outline added");
    },
    [details.syllabusOutline, sanitizeInput, toast]
  );

  const handleRemoveSyllabusOutline = useCallback(
    (index: number) => {
      setDetails((prev) => ({ ...prev, syllabusOutline: prev.syllabusOutline.filter((_, i) => i !== index) }));
      toast.warning("Syllabus outline removed");
    },
    [toast]
  );

  const handleAddCourseGoals = useCallback(
    (value: string) => {
      const sanitizedValue = sanitizeInput(value);
      if (!sanitizedValue || sanitizedValue.length > 200) {
        setDetailsErrors((prev) => ({ ...prev, courseGoals: "Course goal is required and must be ≤ 200 characters" }));
        toast.error("Course goal is required and must be ≤ 200 characters");
        return;
      }
      if (details.courseGoals.includes(sanitizedValue)) {
        setDetailsErrors((prev) => ({ ...prev, courseGoals: "Duplicate course goal" }));
        toast.error("This course goal already exists");
        return;
      }
      setDetails((prev) => ({ ...prev, courseGoals: [...prev.courseGoals, sanitizedValue] }));
      setSingleCourseGoals("");
      setDetailsErrors((prev) => ({ ...prev, courseGoals: "" }));
      toast.success("Course goal added");
    },
    [details.courseGoals, sanitizeInput, toast]
  );

  const handleRemoveCourseGoals = useCallback(
    (index: number) => {
      setDetails((prev) => ({ ...prev, courseGoals: prev.courseGoals.filter((_, i) => i !== index) }));
      toast.warning("Course goal removed");
    },
    [toast]
  );

  const handlePricingAndOfferChange = useCallback(
    (name: keyof OfflineCoursePricingAndOffer, value: any) => {
      const sanitizedValue = typeof value === "string" && name !== "currency" ? sanitizeInput(value) : value;
      setPricingAndOffers((prev) => ({ ...prev, [name]: sanitizedValue }));
      setPricingAndOffersErrors((prev) => ({ ...prev, [name]: "" }));
    },
    [sanitizeInput]
  );

  const handlePaymentPlanChange = useCallback(
    (name: keyof PaymentPlan, value: any) => {
      const sanitizedValue = typeof value === "string" ? sanitizeInput(value) : value;
      setNewPaymentPlan((prev) => ({ ...prev, [name]: sanitizedValue }));
      setPaymentPlanError((prev) => ({ ...prev, [name]: "" }));
    },
    [sanitizeInput]
  );

  const handleAddPaymentPlan = useCallback(
    (plan: PaymentPlan) => {
      const sanitizedPlan = {
        planName: sanitizeInput(plan.planName),
        amount: plan.amount,
        duration: sanitizeInput(plan.duration),
      };
      const errors: PaymentPlanError = {
        planName: sanitizedPlan.planName.trim() && sanitizedPlan.planName.length <= 50 ? "" : "Plan name is required and must be ≤ 50 characters",
        amount: sanitizedPlan.amount > 0 && sanitizedPlan.amount <= pricingAndOffers.courseFeeStructure ? "" : "Amount must be positive and ≤ course fee",
        duration: sanitizedPlan.duration.trim() && sanitizedPlan.duration.length <= 50 ? "" : "Duration is required and must be ≤ 50 characters",
      };
      setPaymentPlanError(errors);
      if (Object.values(errors).some((error) => error)) {
        toast.error("Please fix payment plan errors");
        return;
      }
      if (pricingAndOffers.paymentPlans.some((p) => p.planName === sanitizedPlan.planName)) {
        setPaymentPlanError((prev) => ({ ...prev, planName: "Plan name must be unique" }));
        toast.error("Plan name already exists");
        return;
      }
      setPricingAndOffers((prev) => ({ ...prev, paymentPlans: [...prev.paymentPlans, sanitizedPlan] }));
      setNewPaymentPlan({ amount: 0, duration: "", planName: "" });
      setPaymentPlanError({ amount: "", duration: "", planName: "" });
      toast.success("Payment plan added");
    },
    [pricingAndOffers.paymentPlans, pricingAndOffers.courseFeeStructure, sanitizeInput, toast]
  );

  const handleRemovePaymentPlan = useCallback(
    (planName: string) => {
      setPricingAndOffers((prev) => ({ ...prev, paymentPlans: prev.paymentPlans.filter((plan) => plan.planName !== planName) }));
      toast.warning("Payment plan removed");
    },
    [toast]
  );

  const handleOfferDetailsChange = useCallback(
    (name: keyof Offer_Details, value: any) => {
      const sanitizedValue = typeof value === "string" ? sanitizeInput(value) : value;
      setOfferDetails((prev) => ({ ...prev, [name]: sanitizedValue }));
      setPricingAndOffers((prev) => ({
        ...prev,
        offerDetail: { ...prev.offerDetail!, [name]: sanitizedValue },
      }));
      setOfferError((prev) => ({ ...prev, [name]: "" }));
    },
    [sanitizeInput]
  );

  const handleOfferValidityChange = useCallback(
    (value: Date) => {
      setOfferDetails((prev) => ({ ...prev, offerValidity: value }));
      setPricingAndOffers((prev) => ({
        ...prev,
        offerDetail: { ...prev.offerDetail!, offerValidity: value },
      }));
      setOfferError((prev) => ({ ...prev, offerValidity: "" }));
    },
    []
  );

  const handleSEOAndMarketingChange = useCallback(
    (name: keyof OfflineCourseSEOAndMarketing, value: string) => {
      const sanitizedValue = sanitizeInput(value);
      setSeoAndMarketingData((prev) => ({ ...prev, [name]: sanitizedValue }));
      setSeoAndMarketingError((prev) => ({ ...prev, [name]: "" }));
    },
    [sanitizeInput]
  );

  const handleCourseCategoryChange = useCallback(
    (name: keyof OfflineCourseCategory, value: string | number) => {
      const sanitizedValue = typeof value === "string" ? sanitizeInput(value) : value;
      setSeoAndMarketingData((prev) => ({ ...prev, [name]: sanitizedValue }));
      setCategoryError((prev) => ({ ...prev, [name]: "" }));
    },
    [sanitizeInput]
  );

  const handleSingleTagChange = useCallback(
    (value: string) => {
      setSingleTagField(sanitizeInput(value));
    },
    [sanitizeInput]
  );

  const handleAddTag = useCallback(
    (tag: string) => {
      const sanitizedTag = sanitizeInput(tag);
      if (!sanitizedTag || sanitizedTag.length > 50) {
        setSeoAndMarketingError((prev) => ({ ...prev, tags: "Tag is required and must be ≤ 50 characters" }));
        toast.error("Tag is required and must be ≤ 50 characters");
        return;
      }
      if (seoAndMarketingData.tags.includes(sanitizedTag)) {
        setSeoAndMarketingError((prev) => ({ ...prev, tags: "Tag already exists" }));
        toast.error("This tag already exists");
        return;
      }
      setSeoAndMarketingData((prev) => ({ ...prev, tags: [...prev.tags, sanitizedTag] }));
      setSingleTagField("");
      setSeoAndMarketingError((prev) => ({ ...prev, tags: "" }));
      toast.success("Tag added");
    },
    [seoAndMarketingData.tags, sanitizeInput, toast]
  );

  const handleRemoveTag = useCallback(
    (index: number) => {
      setSeoAndMarketingData((prev) => ({ ...prev, tags: prev.tags.filter((_, i) => i !== index) }));
      toast.warning("Tag removed");
    },
    [toast]
  );

  const handleContactDetailsChange = useCallback(
    (field: keyof ContactDetails, value: string) => {
      const sanitizedValue = sanitizeInput(value);
      setAdditionalFeatures((prev) => ({
        ...prev,
        contactDetails: { ...prev.contactDetails, [field]: sanitizedValue },
      }));
      setContactDetailsError((prev) => ({ ...prev, [field]: "" }));
    },
    [sanitizeInput]
  );

  const handleRefundPolicyChange = useCallback(
    (field: keyof RefundPolicy, value: any) => {
      const sanitizedValue = field === "refundPeriodDays" ? parseInt(value) || 0 : sanitizeInput(value);
      setAdditionalFeatures((prev) => ({
        ...prev,
        refundPolicy: { ...prev.refundPolicy, [field]: sanitizedValue },
      }));
      setRefundPolicyError((prev) => ({ ...prev, [field]: "" }));
    },
    [sanitizeInput]
  );

  const handleFaqChange = useCallback(
    (field: keyof FAQ, value: string) => {
      const sanitizedValue = sanitizeInput(value);
      setFaqs((prev) => ({ ...prev, [field]: sanitizedValue }));
      setFaqErrors((prev) => ({ ...prev, [field]: "" }));
    },
    [sanitizeInput]
  );

  const handleSingleTargetAudienceChange = useCallback(
    (value: string) => {
      setSingleTargetAudience(sanitizeInput(value));
    },
    [sanitizeInput]
  );

  const handleLanguageChange = useCallback(
    (value: string) => {
      setLanguage(sanitizeInput(value));
    },
    [sanitizeInput]
  );

  const handleProvidedMaterialsChange = useCallback(
    (value: string) => {
      setProvidedMaterials(sanitizeInput(value));
    },
    [sanitizeInput]
  );

  const handleRequiredEquipmentsChange = useCallback(
    (value: string) => {
      setRequiredEquipments(sanitizeInput(value));
    },
    [sanitizeInput]
  );

  const handleAccessibilityFeaturesChange = useCallback(
    (value: string) => {
      setAccessibilityFeaturesInput(sanitizeInput(value));
    },
    [sanitizeInput]
  );

  const handleAddFaq = useCallback(
    (faq: FAQ) => {
      const sanitizedFaq = {
        question: sanitizeInput(faq.question),
        answer: sanitizeInput(faq.answer),
      };
      const errors: FAQErrors = {
        question: sanitizedFaq.question.trim() && sanitizedFaq.question.length <= 500 ? "" : "Question is required and must be ≤ 500 characters",
        answer: sanitizedFaq.answer.trim() && sanitizedFaq.answer.length <= 1000 ? "" : "Answer is required and must be ≤ 1000 characters",
      };
      setFaqErrors(errors);
      if (Object.values(errors).some((error) => error)) {
        toast.error("Please fix FAQ errors");
        return;
      }
      if (additionalFeatures.faqs.some((f) => f.question === sanitizedFaq.question)) {
        setFaqErrors((prev) => ({ ...prev, question: "Question must be unique" }));
        toast.error("This question already exists");
        return;
      }
      setAdditionalFeatures((prev) => ({ ...prev, faqs: [...prev.faqs, sanitizedFaq] }));
      setFaqs({ question: "", answer: "" });
      setFaqErrors({ question: "", answer: "" });
      toast.success("FAQ added");
    },
    [additionalFeatures.faqs, sanitizeInput, toast]
  );

  const handleAddTargetAudience = useCallback(
    (audience: string) => {
      const sanitizedAudience = sanitizeInput(audience);
      if (!sanitizedAudience || sanitizedAudience.length > 500) {
        setAdditionalFeaturesErrors((prev) => ({ ...prev, targetedAudience: "Target audience is required and must be ≤ 500 characters" }));
        toast.error("Target audience is required and must be ≤ 500 characters");
        return;
      }
      if (additionalFeatures.targetAudience.includes(sanitizedAudience)) {
        setAdditionalFeaturesErrors((prev) => ({ ...prev, targetedAudience: "This audience already exists" }));
        toast.error("This audience already exists");
        return;
      }
      setAdditionalFeatures((prev) => ({ ...prev, targetAudience: [...prev.targetAudience, sanitizedAudience] }));
      setSingleTargetAudience("");
      setAdditionalFeaturesErrors((prev) => ({ ...prev, targetedAudience: "" }));
      toast.success("Target audience added");
    },
    [additionalFeatures.targetAudience, sanitizeInput, toast]
  );

  const handleAddLanguage = useCallback(
    (lang: string) => {
      const sanitizedLang = sanitizeInput(lang);
      if (!sanitizedLang || sanitizedLang.length > 50 || !/^[a-zA-Z\s]+$/.test(sanitizedLang)) {
        setAdditionalFeaturesErrors((prev) => ({ ...prev, availableLanguages: "Language is required, must be ≤ 50 characters, and alphabetic" }));
        toast.error("Language is required, must be ≤ 50 characters, and alphabetic");
        return;
      }
      if (additionalFeatures.availableLanguages.includes(sanitizedLang)) {
        setAdditionalFeaturesErrors((prev) => ({ ...prev, availableLanguages: "This language already exists" }));
        toast.error("This language already exists");
        return;
      }
      setAdditionalFeatures((prev) => ({ ...prev, availableLanguages: [...prev.availableLanguages, sanitizedLang] }));
      setLanguage("");
      setAdditionalFeaturesErrors((prev) => ({ ...prev, availableLanguages: "" }));
      toast.success("Language added");
    },
    [additionalFeatures.availableLanguages, sanitizeInput, toast]
  );

  const handleAddProvidedMaterials = useCallback(
    (material: string) => {
      const sanitizedMaterial = sanitizeInput(material);
      if (!sanitizedMaterial || sanitizedMaterial.length > 500) {
        setAdditionalFeaturesErrors((prev) => ({ ...prev, materialProvided: "Material is required and must be ≤ 500 characters" }));
        toast.error("Material is required and must be ≤ 500 characters");
        return;
      }
      if (additionalFeatures.materialsProvided.includes(sanitizedMaterial)) {
        setAdditionalFeaturesErrors((prev) => ({ ...prev, materialProvided: "This material already exists" }));
        toast.error("This material already exists");
        return;
      }
      setAdditionalFeatures((prev) => ({ ...prev, materialsProvided: [...prev.materialsProvided, sanitizedMaterial] }));
      setProvidedMaterials("");
      setAdditionalFeaturesErrors((prev) => ({ ...prev, materialProvided: "" }));
      toast.success("Material added");
    },
    [additionalFeatures.materialsProvided, sanitizeInput, toast]
  );

  const handleAddRequiredEquipments = useCallback(
    (equipment: string) => {
      const sanitizedEquipment = sanitizeInput(equipment);
      if (!sanitizedEquipment || sanitizedEquipment.length > 500) {
        setAdditionalFeaturesErrors((prev) => ({ ...prev, equipmentRequired: "Equipment is required and must be ≤ 500 characters" }));
        toast.error("Equipment is required and must be ≤ 500 characters");
        return;
      }
      if (additionalFeatures.equipmentRequired.includes(sanitizedEquipment)) {
        setAdditionalFeaturesErrors((prev) => ({ ...prev, equipmentRequired: "This equipment already exists" }));
        toast.error("This equipment already exists");
        return;
      }
      setAdditionalFeatures((prev) => ({ ...prev, equipmentRequired: [...prev.equipmentRequired, sanitizedEquipment] }));
      setRequiredEquipments("");
      setAdditionalFeaturesErrors((prev) => ({ ...prev, equipmentRequired: "" }));
      toast.success("Equipment added");
    },
    [additionalFeatures.equipmentRequired, sanitizeInput, toast]
  );

  const handleAddAccessibilityFeatures = useCallback(
    (feature: string) => {
      const sanitizedFeature = sanitizeInput(feature);
      if (!sanitizedFeature || sanitizedFeature.length > 500) {
        setAdditionalFeaturesErrors((prev) => ({ ...prev, accessibilityFeatures: "Feature is required and must be ≤ 500 characters" }));
        toast.error("Feature is required and must be ≤ 500 characters");
        return;
      }
      if (additionalFeatures.accessibilityFeatures.includes(sanitizedFeature)) {
        setAdditionalFeaturesErrors((prev) => ({ ...prev, accessibilityFeatures: "This feature already exists" }));
        toast.error("This feature already exists");
        return;
      }
      setAdditionalFeatures((prev) => ({ ...prev, accessibilityFeatures: [...prev.accessibilityFeatures, sanitizedFeature] }));
      setAccessibilityFeaturesInput("");
      setAdditionalFeaturesErrors((prev) => ({ ...prev, accessibilityFeatures: "" }));
      toast.success("Accessibility feature added");
    },
    [additionalFeatures.accessibilityFeatures, sanitizeInput, toast]
  );

  const handleRemoveFaq = useCallback(
    (index: number) => {
      setAdditionalFeatures((prev) => ({ ...prev, faqs: prev.faqs.filter((_, i) => i !== index) }));
      toast.warning("FAQ removed");
    },
    [toast]
  );

  const handleRemoveTargetAudience = useCallback(
    (index: number) => {
      setAdditionalFeatures((prev) => ({ ...prev, targetAudience: prev.targetAudience.filter((_, i) => i !== index) }));
      toast.warning("Target audience removed");
    },
    [toast]
  );

  const handleRemoveLanguage = useCallback(
    (index: number) => {
      setAdditionalFeatures((prev) => ({ ...prev, availableLanguages: prev.availableLanguages.filter((_, i) => i !== index) }));
      toast.warning("Language removed");
    },
    [toast]
  );

  const handleRemoveProvidedMaterials = useCallback(
    (index: number) => {
      setAdditionalFeatures((prev) => ({ ...prev, materialsProvided: prev.materialsProvided.filter((_, i) => i !== index) }));
      toast.warning("Material removed");
    },
    [toast]
  );

  const handleRemoveRequiredEquipments = useCallback(
    (index: number) => {
      setAdditionalFeatures((prev) => ({ ...prev, equipmentRequired: prev.equipmentRequired.filter((_, i) => i !== index) }));
      toast.warning("Equipment removed");
    },
    [toast]
  );

  const handleRemoveAccessibilityFeatures = useCallback(
    (index: number) => {
      setAdditionalFeatures((prev) => ({ ...prev, accessibilityFeatures: prev.accessibilityFeatures.filter((_, i) => i !== index) }));
      toast.warning("Accessibility feature removed");
    },
    [toast]
  );

  const handleToggleRefundPolicy = useCallback(() => {
    setAdditionalFeatures((prev) => ({
      ...prev,
      refundPolicy: { ...prev.refundPolicy, isRefundable: !prev.refundPolicy.isRefundable },
    }));
    setRefundPolicyError({ refundPeriodDays: "", conditions: "" });
  }, []);

  // Save Draft to Backend
  const handleSaveDraft = useCallback(async () => {
    const courseData: OfflineCourseModel = {
      course: details,
      courseCategories: {
        courseCategory: seoAndMarketingData.courseCategory,
        courseSubCategory: seoAndMarketingData.courseSubCategory,
        trendingScore: seoAndMarketingData.trendingScore,
      },
      courseSEOAndMarketing: {
        seoMetaTitle: seoAndMarketingData.seoMetaTitle,
        seoMetaDescription: seoAndMarketingData.seoMetaDescription,
        promoVideoUrl: seoAndMarketingData.promoVideoUrl,
        courseBannerUrl: seoAndMarketingData.courseBannerUrl,
        tags: seoAndMarketingData.tags,
      },
      coursePricingAndOffers: pricingAndOffers,
      courseAdditionalFeatures: additionalFeatures,
      batches, // Updated to batches
    };

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Placeholder API call
      toast.success("Draft saved successfully.");
    } catch (error) {
      console.error("Failed to save draft:", error);
      toast.error("Failed to save draft. Please try again.");
    }
  }, [details, seoAndMarketingData, pricingAndOffers, additionalFeatures, batches, toast]);

  // Clear Form and Local Storage
  const handleClearForm = useCallback(() => {
    if (!confirm("Are you sure you want to clear the form? All unsaved data will be lost.")) return;

    localStorage.removeItem(LOCAL_STORAGE_KEY);
    setDetails({
      courseName: "",
      courseGoals: [],
      courseLevel: "Beginner",
      courseDescription: "",
      courseDurationInDays: 0,
      courseDailyClassDurationInMinutes: 0,
      syllabusOutline: [],
    });
    setPricingAndOffers({
      currency: "",
      courseFeeStructure: 0,
      paymentPlans: [],
      isCourseOnOffer: false,
      offerDetail: {
        offerCode: "",
        offerDescription: "",
        offerSlogan: "",
        discountPercentage: 0,
        offerValidity: new Date(),
        offerSeatsAvailable: 0,
      },
    });
    setSeoAndMarketingData({
      courseBannerUrl: "",
      promoVideoUrl: "",
      seoMetaDescription: "",
      seoMetaTitle: "",
      tags: [],
      courseCategory: "",
      courseSubCategory: "",
      trendingScore: 0,
    });
    setAdditionalFeatures({
      faqs: [],
      refundPolicy: { isRefundable: false, refundPeriodDays: 0, conditions: "" },
      targetAudience: [],
      availableLanguages: [],
      materialsProvided: [],
      equipmentRequired: [],
      accessibilityFeatures: [],
      contactDetails: { phone: "", email: "" },
      termsAndCondition: ""
    });
    setBatches([]);
    setBatchDetails({
      batchName: "",
      batchInstructors: [],
      maxStudentCount: 0,
      batchStartDate:"",
      enrollmentStartDate: "",
      enrollmentEndDate: "",
      address: {
        street: "",
        city: "",
        state: "",
        country: "",
        zipCode: "",
      },
    });
    setSingleSyllabusOutline("");
    setSingleCourseGoals("");
    setNewPaymentPlan({ amount: 0, duration: "", planName: "" });
    setOfferDetails({
      offerCode: "",
      offerDescription: "",
      offerSlogan: "",
      discountPercentage: 0,
      offerValidity: new Date(),
      offerSeatsAvailable: 0,
    });
    setSingleTagField("");
    setSingleTargetAudience("");
    setLanguage("");
    setProvidedMaterials("");
    setRequiredEquipments("");
    setAccessibilityFeaturesInput("");
    setFaqs({ question: "", answer: "" });
    setSelectedTab("Details");
    toast.success("Form cleared.");
  }, [toast]);

  // Form Submission
  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (!confirm("Are you sure you want to submit the course?")) return;

      setIsSubmitting(true);

      const isDetailsValid = validateDetails();
      const isPricingValid = validatePricingAndOffers();
      const isSEOValid = validateSEOAndMarketing();
      const isFeaturesValid = validateAdditionalFeatures();
      let isBatchValid = batches.length > 0;

      if (batches.length === 0) {
        isBatchValid = validateBatch();
        if (!isBatchValid) {
          toast.error("Please add at least one valid batch or fix batch errors.");
        }
      }

      if (!isDetailsValid) setSelectedTab("Details");
      else if (!isPricingValid) setSelectedTab("Pricing & Offers");
      else if (!isSEOValid) setSelectedTab("SEO & Marketing");
      else if (!isFeaturesValid) setSelectedTab("Additional Features");
      else if (!isBatchValid) setSelectedTab("Batch");

      if (isDetailsValid && isPricingValid && isSEOValid && isFeaturesValid && isBatchValid) {
        const courseData: OfflineCourseModel = {
          course: details,
          courseCategories: {
            courseCategory: seoAndMarketingData.courseCategory,
            courseSubCategory: seoAndMarketingData.courseSubCategory,
            trendingScore: seoAndMarketingData.trendingScore,
          },
          courseSEOAndMarketing: {
            seoMetaTitle: seoAndMarketingData.seoMetaTitle,
            seoMetaDescription: seoAndMarketingData.seoMetaDescription,
            promoVideoUrl: seoAndMarketingData.promoVideoUrl,
            courseBannerUrl: seoAndMarketingData.courseBannerUrl,
            tags: seoAndMarketingData.tags,
          },
          coursePricingAndOffers: pricingAndOffers,
          courseAdditionalFeatures: additionalFeatures,
          batches: batches.length > 0 ? batches : [batchDetails], // Use batches or fall back to batchDetails
        };

        try {

          const response = await fetch("/api/courses/create-offline-course", {
            method: "POST",
            credentials: "include",
            body: JSON.stringify(courseData)
          })
          if (!response.ok) {
            const errorData = await response.json()
            console.log(errorData)
          }
          const data = await response.json()
          console.log(data)
          // Clear localStorage and reset form
          localStorage.removeItem(LOCAL_STORAGE_KEY);
          setDetails({
            courseName: "",
            courseGoals: [],
            courseLevel: "Beginner",
            courseDescription: "",
            courseDurationInDays: 0,
            courseDailyClassDurationInMinutes: 0,
            syllabusOutline: [],
          });
          setPricingAndOffers({
            currency: "",
            courseFeeStructure: 0,
            paymentPlans: [],
            isCourseOnOffer: false,
            offerDetail: {
              offerCode: "",
              offerDescription: "",
              offerSlogan: "",
              discountPercentage: 0,
              offerValidity: new Date(),
              offerSeatsAvailable: 0,
            },
          });
          setSeoAndMarketingData({
            courseBannerUrl: "",
            promoVideoUrl: "",
            seoMetaDescription: "",
            seoMetaTitle: "",
            tags: [],
            courseCategory: "",
            courseSubCategory: "",
            trendingScore: 0,
          });
          setAdditionalFeatures({
            faqs: [],
            refundPolicy: { isRefundable: false, refundPeriodDays: 0, conditions: "" },
            targetAudience: [],
            availableLanguages: [],
            materialsProvided: [],
            equipmentRequired: [],
            accessibilityFeatures: [],
            contactDetails: { phone: "", email: "" },
            termsAndCondition:""
          });
          setBatches([]);
          setBatchDetails({
            batchName: "",
            batchInstructors: [],
            batchStartDate:"",
            maxStudentCount: 0,
            enrollmentStartDate: "",
            enrollmentEndDate: "",
            address: {
              street: "",
              city: "",
              state: "",
              country: "",
              zipCode: "",
            },
          });
          setSingleSyllabusOutline("");
          setSingleCourseGoals("");
          setNewPaymentPlan({ amount: 0, duration: "", planName: "" });
          setOfferDetails({
            offerCode: "",
            offerDescription: "",
            offerSlogan: "",
            discountPercentage: 0,
            offerValidity: new Date(),
            offerSeatsAvailable: 0,
          });
          setSingleTagField("");
          setSingleTargetAudience("");
          setLanguage("");
          setProvidedMaterials("");
          setRequiredEquipments("");
          setAccessibilityFeaturesInput("");
          setFaqs({ question: "", answer: "" });
          setSelectedTab("Details");
        } catch (error) {
          console.error("Submission error:", error);
          toast.error("Failed to submit course and batches. Please try again.");
        }
      } else {
        toast.error("Please fix errors in the form before submitting.");
      }

      setIsSubmitting(false);
    },
    [
      validateDetails,
      validatePricingAndOffers,
      validateSEOAndMarketing,
      validateAdditionalFeatures,
      validateBatch,
      details,
      pricingAndOffers,
      seoAndMarketingData,
      additionalFeatures,
      batches,
      batchDetails,
      toast,
    ]
  );

  // Memoized Tab Content
  const tabContent = useMemo(
    () => ({
      "Details": (
        <DetailsTab
          details={details}
          detailsErrors={detailsErrors}
          singleSyllabusOutline={singleSyllabusOutline}
          singleCourseGoals={singleCourseGoals}
          onDetailsChange={handleDetailsChange}
          onSyllabusOutlineChange={handleSyllabusOutlineChange}
          onCourseGoalsChange={handleCourseGoalsChange}
          onAddSyllabusOutline={handleAddSyllabusOutline}
          onRemoveSyllabusOutline={handleRemoveSyllabusOutline}
          onAddCourseGoals={handleAddCourseGoals}
          onRemoveCourseGoals={handleRemoveCourseGoals}
        />
      ),
      "Pricing & Offers": (
        <PricingAndOfferTab
          pricingAndOffers={pricingAndOffers}
          pricingAndOffersErrors={pricingAndOffersErrors}
          newPaymentPlan={newPaymentPlan}
          paymentPlanError={paymentPlanError}
          offerDetails={offerDetails}
          offerError={offerError}
          worldCurrencies={worldCurrencies}
          onPricingAndOfferChange={handlePricingAndOfferChange}
          onPaymentPlanChange={handlePaymentPlanChange}
          onAddPaymentPlan={handleAddPaymentPlan}
          onRemovePaymentPlan={handleRemovePaymentPlan}
          onOfferDetailsChange={handleOfferDetailsChange}
          onOfferValidityChange={handleOfferValidityChange}
        />
      ),
      "SEO & Marketing": (
        <SEOAndMarketingTab
          seoAndMarketingData={seoAndMarketingData}
          seoAndMarketingError={seoAndMarketingError}
          categoryError={categoryError}
          singleTagField={singleTagField}
          onSEOAndMarketingChange={handleSEOAndMarketingChange}
          onCourseCategoryChange={handleCourseCategoryChange}
          onSingleTagChange={handleSingleTagChange}
          onAddTag={handleAddTag}
          onRemoveTag={handleRemoveTag}
        />
      ),
      "Additional Features": (
        <AdditionalFeaturesTab
          onTermsAndConditionChange={handleTermsAndCondition}
          additionalFeatures={additionalFeatures}
          additionalFeaturesErrors={additionalFeaturesErrors}
          contactDetailsError={contactDetailsError}
          refundPolicyError={refundPolicyError}
          faqErrors={faqErrors}
          singleTargetAudience={singleTargetAudience}
          language={language}
          providedMaterials={providedMaterials}
          requiredEquipments={requiredEquipments}
          accessibilityFeatures={accessibilityFeaturesInput}
          faqs={faqs}
          onContactDetailsChange={handleContactDetailsChange}
          onRefundPolicyChange={handleRefundPolicyChange}
          onFaqChange={handleFaqChange}
          onSingleTargetAudienceChange={handleSingleTargetAudienceChange}
          onLanguageChange={handleLanguageChange}
          onProvidedMaterialsChange={handleProvidedMaterialsChange}
          onRequiredEquipmentsChange={handleRequiredEquipmentsChange}
          onAccessibilityFeaturesChange={handleAccessibilityFeaturesChange}
          onAddFaq={handleAddFaq}
          onAddTargetAudience={handleAddTargetAudience}
          onAddLanguage={handleAddLanguage}
          onAddProvidedMaterials={handleAddProvidedMaterials}
          onAddRequiredEquipments={handleAddRequiredEquipments}
          onAddAccessibilityFeatures={handleAddAccessibilityFeatures}
          onRemoveFaq={handleRemoveFaq}
          onRemoveTargetAudience={handleRemoveTargetAudience}
          onRemoveLanguage={handleRemoveLanguage}
          onRemoveProvidedMaterials={handleRemoveProvidedMaterials}
          onRemoveRequiredEquipments={handleRemoveRequiredEquipments}
          onRemoveAccessibilityFeatures={handleRemoveAccessibilityFeatures}
          onToggleRefundPolicy={handleToggleRefundPolicy}
        />
      ),
      "Batch": (
        <BatchTab
          onAddBatches={handleAddBatches}
          onRemoveBatches={handleRemoveBatches}
          batches={batches}
          batchDetails={batchDetails}
          batchErrors={batchErrors}
          onAddInstructor={handleAddInstructor}
          onAddressChange={handleAddressChange}
          onBatchChange={handleBatchChange}
          onRemoveInstructor={handleRemoveInstructor}
        />
      ),
    }),
    [
      details,
      detailsErrors,
      singleSyllabusOutline,
      singleCourseGoals,
      pricingAndOffers,
      pricingAndOffersErrors,
      newPaymentPlan,
      paymentPlanError,
      offerDetails,
      offerError,
      seoAndMarketingData,
      seoAndMarketingError,
      categoryError,
      singleTagField,
      additionalFeatures,
      additionalFeaturesErrors,
      contactDetailsError,
      refundPolicyError,
      faqErrors,
      singleTargetAudience,
      language,
      providedMaterials,
      requiredEquipments,
      accessibilityFeaturesInput,
      faqs,
      batches,
      batchDetails,
      batchErrors,
      handleDetailsChange,
      handleSyllabusOutlineChange,
      handleCourseGoalsChange,
      handleAddSyllabusOutline,
      handleRemoveSyllabusOutline,
      handleAddCourseGoals,
      handleRemoveCourseGoals,
      handlePricingAndOfferChange,
      handlePaymentPlanChange,
      handleAddPaymentPlan,
      handleRemovePaymentPlan,
      handleOfferDetailsChange,
      handleOfferValidityChange,
      handleSEOAndMarketingChange,
      handleCourseCategoryChange,
      handleSingleTagChange,
      handleAddTag,
      handleRemoveTag,
      handleContactDetailsChange,
      handleRefundPolicyChange,
      handleFaqChange,
      handleSingleTargetAudienceChange,
      handleLanguageChange,
      handleProvidedMaterialsChange,
      handleRequiredEquipmentsChange,
      handleAccessibilityFeaturesChange,
      handleAddFaq,
      handleAddTargetAudience,
      handleAddLanguage,
      handleAddProvidedMaterials,
      handleAddRequiredEquipments,
      handleAddAccessibilityFeatures,
      handleRemoveFaq,
      handleRemoveTargetAudience,
      handleRemoveLanguage,
      handleRemoveProvidedMaterials,
      handleRemoveRequiredEquipments,
      handleRemoveAccessibilityFeatures,
      handleToggleRefundPolicy,
      handleAddBatches,
      handleRemoveBatches,
      handleAddInstructor,
      handleAddressChange,
      handleBatchChange,
      handleRemoveInstructor,
    ]
  );

  return (
    <>
      <Head>
        <title>Create New Offline Course | IIMs</title>
        <meta
          name="description"
          content="Create and manage offline courses with comprehensive details, pricing, SEO, and batch information."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta property="og:title" content="Create New Offline Course | IIMs" />
        <meta
          property="og:description"
          content="Create and manage offline courses with comprehensive details, pricing, SEO, and batch information."
        />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Create New Offline Course | IIMs" />
        <meta
          name="twitter:description"
          content="Create and manage offline courses with comprehensive details, pricing, SEO, and batch information."
        />
      </Head>

      <div className="min-h-screen py-8 flex items-center justify-center bg-gradient-to-br from-orange-200 via-orange-300 to-orange-400 dark:from-stone-800 dark:via-stone-900 dark:to-black">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-6xl p-6 rounded-lg"
          noValidate
          aria-label="Create Offline Course Form"
        >
          <div>
            <div className="flex border-b border-stone-200 dark:border-stone-700 mb-6" role="tablist">
              {tabs.map((tab, index) => (
                <button
                  key={index}
                  type="button"
                  id={`${tab.replace(/\s+/g, "-").toLowerCase()}-tab`}
                  onClick={() => setSelectedTab(tab)}
                  className={`px-4 py-2 font-medium transition-colors duration-200 ${selectedTab === tab
                    ? "text-orange-600 dark:text-orange-500 border-b-2 border-orange-600 dark:border-orange-500"
                    : "text-stone-600 dark:text-stone-400 hover:text-orange-500 dark:hover:text-orange-400"
                    }`}
                  role="tab"
                  aria-selected={selectedTab === tab}
                  aria-controls={`${tab.replace(/\s+/g, "-").toLowerCase()}-panel`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {tabs.map((tab) => (
              <div
                key={tab}
                role="tabpanel"
                id={`${tab.replace(/\s+/g, "-").toLowerCase()}-panel`}
                aria-labelledby={`${tab.replace(/\s+/g, "-").toLowerCase()}-tab`}
                className={selectedTab !== tab ? "hidden" : ""}
              >
                {tabContent[tab]}
              </div>
            ))}
          </div>

          <div className="flex gap-4 mt-6">
            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={isSubmitting}
              className={`flex-1 p-3 bg-stone-600 text-stone-100 rounded font-bold transition-opacity duration-200 ${isSubmitting ? "opacity-50 cursor-not-allowed" : "hover:bg-stone-500 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2"
                }`}
              aria-label="Save draft"
            >
              Save Draft
            </button>
            <button
              type="button"
              onClick={handleClearForm}
              disabled={isSubmitting}
              className={`flex-1 p-3 bg-red-600 text-stone-100 rounded font-bold transition-opacity duration-200 ${isSubmitting ? "opacity-50 cursor-not-allowed" : "hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                }`}
              aria-label="Clear form"
            >
              Clear Form
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex-1 p-3 bg-orange-600 text-stone-100 rounded font-bold transition-opacity duration-200 ${isSubmitting ?
                "opacity-50 cursor-not-allowed" : "hover:bg-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                }`}
              aria-label={isSubmitting ? "Submitting course" : "Submit course"}
            >
              {isSubmitting ? "Submitting..." : "Submit Course"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}