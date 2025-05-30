"use client";
import { useCallback, useMemo, useState, useEffect } from "react";
import BasicInfoTab from "./Tabs/BasicInfoTab";
import PricingAndOfferTab from "./Tabs/PricingAndOfferTab";
import SEOAndMarketingTab from "./Tabs/SEOAndMarketingTab";
import { AdditionalFeaturesTab } from "./Tabs/AdditionalInfoTab";
import { ModuleTab } from "./Tabs/Contents.Tab";
import { useRouter } from "next/navigation";
import { worldCurrencies } from "../../offline/create-offline-course/page";
import Head from "next/head";
import { useAdminContext } from "@/app/Context/AdminProvider";

// Interfaces for BasicInfoTab
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

export interface BasicInfoDetails {
  courseName: string;
  courseGoals: string[];
  courseLevel: "Beginner" | "Intermediate" | "Advanced";
  syllabusOutline: string[];
  courseDescription: string;
  courseDurationInHours: number;
  courseCategory: string;
  courseSubCategory: string;
  preRequisites: string[];
  courseBannerUrl: string;
  trendingScore: number;
}

// Interfaces for PricingAndOfferTab
interface OfferDetails {
  offerCode: string;
  offerDescription: string;
  offerSlogan: string;
  discountPercentage: number;
  offerValidity: Date;
  offerSeatsAvailable: number;
}

interface PricingAndOffers {
  currency: string;
  basePrice: number;
  isCourseOnOffer: boolean;
  offerDetails: OfferDetails[];
  termsAndConditions: string;
  courseValidityInMonths: number;
}

interface PricingAndOfferError {
  currency: string;
  basePrice: string;
  isCourseOnOffer: string;
  offerDetails: string;
  termsAndConditions: string;
  courseValidityInMonths: string;
}

interface OfferError {
  offerCode: string;
  offerDescription: string;
  offerSlogan: string;
  discountPercentage: string;
  offerValidity: string;
  offerSeatsAvailable: string;
}

// Interfaces for SEOAndMarketingTab
interface ISeoMarketing {
  seoMetaTitle?: string;
  seoMetaDescription?: string;
  tags: string[];
  promoVideoUrl?: string;
}

interface SeoMarketingError {
  seoMetaTitle: string;
  seoMetaDescription: string;
  tags: string;
  promoVideoUrl: string;
}

// Interfaces for AdditionalFeaturesTab
interface ContactDetails {
  phone: string;
  email: string;
}

interface ContactDetailsError {
  email: string;
  phone: string;
}

interface RefundPolicy {
  isRefundable: boolean;
  refundPeriodDays: number;
  conditions: string;
}

interface RefundPolicyError {
  refundPeriodDays: string;
  conditions: string;
}

interface FAQ {
  question: string;
  answer: string;
}

interface FAQErrors {
  question: string;
  answer: string;
}

interface I_Offline_Course_Additional_Features {
  faqs: FAQ[];
  refundPolicy: RefundPolicy;
  targetAudience: string[];
  availableLanguages: string[];
  certificateTemplateUrl: string;
  contactDetails: ContactDetails;
}

interface AdditionalFeaturesErrors {
  faqs: string;
  availableLanguages: string;
  targetedAudience: string;
  certificateTemplateUrl: string;
  contactDetails: string;
}

// Interfaces for ModuleTab
interface Course_Modules {
  moduleTitle: string;
  moduleDescription: string;
  moduleDurationInDays: number;
  moduleBannerUrl: string;
  moduleLearningObjectives: string[];
  articleUrl: string;
  notesUrl: string;
  order: number;
}

interface Course_Module_Error {
  moduleBannerUrl: string;
  moduleDescription: string;
  moduleDurationInDays: string;
  moduleLearningObjectives: string;
  moduleTitle: string;
  notesUrl: string;
  articleUrl: string;
  order: string;
}

export default function Page(): React.ReactElement {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const {admin} = useAdminContext()

  // State for BasicInfoTab
  const [basicInformationDetails, setBasicInformationDetails] = useState<BasicInfoDetails>({
    courseName: "",
    courseGoals: [],
    courseLevel: "Beginner",
    syllabusOutline: [],
    courseDescription: "",
    courseDurationInHours: 0,
    courseCategory: "",
    courseSubCategory: "",
    preRequisites: [],
    courseBannerUrl: "",
    trendingScore: 0,
  });
  const [basicInformationErrors, setBasicInformationErrors] = useState<BasicInfoErrors>({
    courseName: "",
    courseGoals: "",
    courseLevel: "",
    courseDescription: "",
    syllabusOutline: "",
    courseDurationInHours: "",
    courseCategory: "",
    courseSubCategory: "",
    preRequisites: "",
    courseBannerUrl: "",
  });
  const [singleCourseGoals, setSingleCourseGoals] = useState<string>("");
  const [singleSyllabusOutline, setSingleSyllabusOutline] = useState<string>("");
  const [singlePreRequisites, setSinglePreRequisites] = useState<string>("");

  // State for PricingAndOfferTab
  const [pricingAndOffers, setPricingAndOffers] = useState<PricingAndOffers>({
    currency: "",
    basePrice: 1,
    isCourseOnOffer: false,
    offerDetails: [],
    termsAndConditions: "",
    courseValidityInMonths: 1,
  });
  const [pricingAndOffersErrors, setPricingAndOffersErrors] = useState<PricingAndOfferError>({
    currency: "",
    basePrice: "",
    isCourseOnOffer: "",
    offerDetails: "",
    termsAndConditions: "",
    courseValidityInMonths: "",
  });
  const [newOfferDetail, setNewOfferDetail] = useState<OfferDetails>({
    offerCode: "",
    offerDescription: "",
    offerSlogan: "",
    discountPercentage: 1,
    offerValidity: new Date(),
    offerSeatsAvailable: 1,
  });
  const [offerError, setOfferError] = useState<OfferError>({
    offerCode: "",
    offerDescription: "",
    offerSlogan: "",
    discountPercentage: "",
    offerValidity: "",
    offerSeatsAvailable: "",
  });

  // State for SEOAndMarketingTab
  const [seoAndMarketingData, setSeoAndMarketingData] = useState<ISeoMarketing>({
    seoMetaTitle: "",
    seoMetaDescription: "",
    tags: [],
    promoVideoUrl: "",
  });
  const [seoAndMarketingError, setSeoAndMarketingError] = useState<SeoMarketingError>({
    seoMetaTitle: "",
    seoMetaDescription: "",
    tags: "",
    promoVideoUrl: "",
  });
  const [singleTagField, setSingleTagField] = useState<string>("");

  // State for AdditionalFeaturesTab
  const [additionalFeatures, setAdditionalFeatures] = useState<I_Offline_Course_Additional_Features>({
    faqs: [],
    refundPolicy: {
      isRefundable: false,
      refundPeriodDays: 1,
      conditions: "",
    },
    targetAudience: [],
    availableLanguages: [],
    certificateTemplateUrl: "",
    contactDetails: {
      phone: "",
      email: "",
    },
  });
  const [additionalFeaturesErrors, setAdditionalFeaturesErrors] = useState<AdditionalFeaturesErrors>({
    faqs: "",
    availableLanguages: "",
    targetedAudience: "",
    certificateTemplateUrl: "",
    contactDetails: "",
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
  const [faqs, setFaqs] = useState<FAQ>({ question: "", answer: "" });

  // State for ModuleTab
  const [modules, setModules] = useState<Course_Modules[]>([]);
  const [singleCourseModule, setSingleCourseModule] = useState<Course_Modules>({
    moduleTitle: "",
    moduleDescription: "",
    moduleDurationInDays: 1,
    moduleBannerUrl: "",
    moduleLearningObjectives: [],
    notesUrl: "",
    articleUrl: "",
    order: 0,
  });
  const [singleCourseModuleError, setSingleCourseModuleError] = useState<Course_Module_Error>({
    moduleBannerUrl: "",
    moduleDescription: "",
    moduleDurationInDays: "",
    moduleLearningObjectives: "",
    moduleTitle: "",
    notesUrl: "",
    articleUrl: "",
    order: "",
  });
  const [learningObjective, setLearningObjective] = useState<string>("");

  // State for tab selection
  const [selectedTab, setSelectedTab] = useState("BasicDetails");

  // World currencies for PricingAndOfferTab
  // const worldCurrencies = ["USD", "EUR", "GBP", "INR", "AUD", "CAD", "JPY"];

  const tabs = [
    "BasicDetails",
    "PricingAndOffer",
    "SEOAndMarketing",
    "Additional Information",
    "ContentModule",
  ];

  // LocalStorage key for storing form data
  const FORM_STORAGE_KEY = "courseFormData";

  // Load saved data from localStorage on component mount
  useEffect(() => {
    const savedData = localStorage.getItem(FORM_STORAGE_KEY);
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);

        // Validate and set BasicInfoTab data
        if (parsedData.basicInformationDetails) {
          setBasicInformationDetails((prev) => ({
            ...prev,
            ...parsedData.basicInformationDetails,
            courseGoals: Array.isArray(parsedData.basicInformationDetails.courseGoals)
              ? parsedData.basicInformationDetails.courseGoals
              : [],
            syllabusOutline: Array.isArray(parsedData.basicInformationDetails.syllabusOutline)
              ? parsedData.basicInformationDetails.syllabusOutline
              : [],
            preRequisites: Array.isArray(parsedData.basicInformationDetails.preRequisites)
              ? parsedData.basicInformationDetails.preRequisites
              : [],
          }));
        }
        if (parsedData.basicInformationErrors) {
          setBasicInformationErrors((prev) => ({
            ...prev,
            ...parsedData.basicInformationErrors,
          }));
        }
        setSingleCourseGoals(parsedData.singleCourseGoals || "");
        setSingleSyllabusOutline(parsedData.singleSyllabusOutline || "");
        setSinglePreRequisites(parsedData.singlePreRequisites || "");

        // Validate and set PricingAndOfferTab data
        if (parsedData.pricingAndOffers) {
          setPricingAndOffers((prev) => ({
            ...prev,
            ...parsedData.pricingAndOffers,
            offerDetails: Array.isArray(parsedData.pricingAndOffers.offerDetails)
              ? parsedData.pricingAndOffers.offerDetails.map((offer: any) => ({
                  ...offer,
                  offerValidity: offer.offerValidity ? new Date(offer.offerValidity) : new Date(),
                }))
              : [],
          }));
        }
        if (parsedData.pricingAndOffersErrors) {
          setPricingAndOffersErrors((prev) => ({
            ...prev,
            ...parsedData.pricingAndOffersErrors,
          }));
        }
        if (parsedData.newOfferDetail) {
          setNewOfferDetail({
            ...parsedData.newOfferDetail,
            offerValidity: parsedData.newOfferDetail.offerValidity
              ? new Date(parsedData.newOfferDetail.offerValidity)
              : new Date(),
          });
        }
        if (parsedData.offerError) {
          setOfferError((prev) => ({
            ...prev,
            ...parsedData.offerError,
          }));
        }

        // Validate and set SEOAndMarketingTab data
        if (parsedData.seoAndMarketingData) {
          setSeoAndMarketingData((prev) => ({
            ...prev,
            ...parsedData.seoAndMarketingData,
            tags: Array.isArray(parsedData.seoAndMarketingData.tags)
              ? parsedData.seoAndMarketingData.tags
              : [],
          }));
        }
        if (parsedData.seoAndMarketingError) {
          setSeoAndMarketingError((prev) => ({
            ...prev,
            ...parsedData.seoAndMarketingError,
          }));
        }
        setSingleTagField(parsedData.singleTagField || "");

        // Validate and set AdditionalFeaturesTab data
        if (parsedData.additionalFeatures) {
          setAdditionalFeatures((prev) => ({
            ...prev,
            ...parsedData.additionalFeatures,
            faqs: Array.isArray(parsedData.additionalFeatures.faqs)
              ? parsedData.additionalFeatures.faqs
              : [],
            targetAudience: Array.isArray(parsedData.additionalFeatures.targetAudience)
              ? parsedData.additionalFeatures.targetAudience
              : [],
            availableLanguages: Array.isArray(parsedData.additionalFeatures.availableLanguages)
              ? parsedData.additionalFeatures.availableLanguages
              : [],
          }));
        }
        if (parsedData.additionalFeaturesErrors) {
          setAdditionalFeaturesErrors((prev) => ({
            ...prev,
            ...parsedData.additionalFeaturesErrors,
          }));
        }
        if (parsedData.contactDetailsError) {
          setContactDetailsError((prev) => ({
            ...prev,
            ...parsedData.contactDetailsError,
          }));
        }
        if (parsedData.refundPolicyError) {
          setRefundPolicyError((prev) => ({
            ...prev,
            ...parsedData.refundPolicyError,
          }));
        }
        if (parsedData.faqErrors) {
          setFaqErrors((prev) => ({
            ...prev,
            ...parsedData.faqErrors,
          }));
        }
        setSingleTargetAudience(parsedData.singleTargetAudience || "");
        setLanguage(parsedData.language || "");
        setFaqs(parsedData.faqs || { question: "", answer: "" });

        // Validate and set ModuleTab data
        if (parsedData.modules) {
          setModules(
            Array.isArray(parsedData.modules)
              ? parsedData.modules.map((module: any) => ({
                  ...module,
                  moduleLearningObjectives: Array.isArray(module.moduleLearningObjectives)
                    ? module.moduleLearningObjectives
                    : [],
                }))
              : []
          );
        }
        if (parsedData.singleCourseModule) {
          setSingleCourseModule({
            ...parsedData.singleCourseModule,
            moduleLearningObjectives: Array.isArray(
              parsedData.singleCourseModule.moduleLearningObjectives
            )
              ? parsedData.singleCourseModule.moduleLearningObjectives
              : [],
          });
        }
        if (parsedData.singleCourseModuleError) {
          setSingleCourseModuleError((prev) => ({
            ...prev,
            ...parsedData.singleCourseModuleError,
          }));
        }
        setLearningObjective(parsedData.learningObjective || "");

        // Validate and set tab selection
        if (parsedData.selectedTab) {
          setSelectedTab(parsedData.selectedTab);
        }

        // Validate and set submitting state
        if (typeof parsedData.isSubmitting === "boolean") {
          setIsSubmitting(parsedData.isSubmitting);
        }
      } catch (error) {
        console.error("Error parsing saved form data:", error);
        localStorage.removeItem(FORM_STORAGE_KEY); // Clear invalid data
      }
    }
  }, []);

  // Save all states to localStorage whenever they change
  useEffect(() => {
    const formData = {
      isSubmitting,
      basicInformationDetails,
      basicInformationErrors,
      singleCourseGoals,
      singleSyllabusOutline,
      singlePreRequisites,
      pricingAndOffers,
      pricingAndOffersErrors,
      newOfferDetail,
      offerError,
      seoAndMarketingData,
      seoAndMarketingError,
      singleTagField,
      additionalFeatures,
      additionalFeaturesErrors,
      contactDetailsError,
      refundPolicyError,
      faqErrors,
      singleTargetAudience,
      language,
      faqs,
      modules,
      singleCourseModule,
      singleCourseModuleError,
      learningObjective,
      selectedTab,
    };
    localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(formData));
  }, [
    isSubmitting,
    basicInformationDetails,
    basicInformationErrors,
    singleCourseGoals,
    singleSyllabusOutline,
    singlePreRequisites,
    pricingAndOffers,
    pricingAndOffersErrors,
    newOfferDetail,
    offerError,
    seoAndMarketingData,
    seoAndMarketingError,
    singleTagField,
    additionalFeatures,
    additionalFeaturesErrors,
    contactDetailsError,
    refundPolicyError,
    faqErrors,
    singleTargetAudience,
    language,
    faqs,
    modules,
    singleCourseModule,
    singleCourseModuleError,
    learningObjective,
    selectedTab,
  ]);

  // Handlers for BasicInfoTab
  const handleAddPreRequisites = useCallback((value: string) => {
    setBasicInformationDetails((prev) => ({
      ...prev,
      preRequisites: [...prev.preRequisites, value],
    }));
  }, []);

  const handleAddSyllabusOutline = useCallback((value: string) => {
    setBasicInformationDetails((prev) => ({
      ...prev,
      syllabusOutline: [...prev.syllabusOutline, value],
    }));
  }, []);

  const handleAddCourseGoals = useCallback((value: string) => {
    setBasicInformationDetails((prev) => ({
      ...prev,
      courseGoals: [...prev.courseGoals, value],
    }));
  }, []);

  const handleRemoveCourseGoals = useCallback((index: number) => {
    setBasicInformationDetails((prev) => ({
      ...prev,
      courseGoals: prev.courseGoals.filter((_, i) => i !== index),
    }));
  }, []);

  const handleRemovePreRequisites = useCallback((index: number) => {
    setBasicInformationDetails((prev) => ({
      ...prev,
      preRequisites: prev.preRequisites.filter((_, i) => i !== index),
    }));
  }, []);

  const handleRemoveSyllabusOutline = useCallback((index: number) => {
    setBasicInformationDetails((prev) => ({
      ...prev,
      syllabusOutline: prev.syllabusOutline.filter((_, i) => i !== index),
    }));
  }, []);

  const handleOnDetailChange = useCallback(
    (name: keyof BasicInfoDetails, value: any) => {
      setBasicInformationDetails((prev) => ({ ...prev, [name]: value }));
      setBasicInformationErrors((prev) => ({ ...prev, [name]: "" }));
    },
    []
  );

  // Handlers for PricingAndOfferTab
  const handlePricingAndOfferChange = useCallback(
    (name: keyof PricingAndOffers, value: any) => {
      setPricingAndOffers((prev) => ({ ...prev, [name]: value }));
      setPricingAndOffersErrors((prev) => ({ ...prev, [name]: "" }));
    },
    []
  );

  const handleNewOfferDetailChange = useCallback(
    (name: keyof OfferDetails, value: any) => {
      setNewOfferDetail((prev) => ({ ...prev, [name]: value }));
      setOfferError((prev) => ({ ...prev, [name]: "" }));
    },
    []
  );

  const handleAddOfferDetail = useCallback(
    (offer: OfferDetails) => {
      setPricingAndOffers((prev) => ({
        ...prev,
        offerDetails: [...prev.offerDetails, offer],
      }));
      setPricingAndOffersErrors((prev) => ({ ...prev, offerDetails: "" }));
    },
    []
  );

  const handleRemoveOfferDetail = useCallback((index: number) => {
    setPricingAndOffers((prev) => ({
      ...prev,
      offerDetails: prev.offerDetails.filter((_, i) => i !== index),
    }));
  }, []);

  const handleOfferValidityChange = useCallback((value: Date) => {
    setNewOfferDetail((prev) => ({ ...prev, offerValidity: value }));
    setOfferError((prev) => ({ ...prev, offerValidity: "" }));
  }, []);

  // Handlers for SEOAndMarketingTab
  const handleSEOAndMarketingChange = useCallback(
    (name: keyof ISeoMarketing, value: string | string[]) => {
      setSeoAndMarketingData((prev) => ({ ...prev, [name]: value }));
      setSeoAndMarketingError((prev) => ({ ...prev, [name]: "" }));
    },
    []
  );

  const handleSingleTagChange = useCallback((value: string) => {
    setSingleTagField(value);
    setSeoAndMarketingError((prev) => ({ ...prev, tags: "" }));
  }, []);

  const handleAddTag = useCallback(
    (tag: string) => {
      setSeoAndMarketingData((prev) => ({
        ...prev,
        tags: [...prev.tags, tag],
      }));
      setSeoAndMarketingError((prev) => ({ ...prev, tags: "" }));
    },
    []
  );

  const handleRemoveTag = useCallback((index: number) => {
    setSeoAndMarketingData((prev) => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index),
    }));
  }, []);

  // Handlers for AdditionalFeaturesTab
  const handleContactDetailsChange = useCallback((field: keyof ContactDetails, value: string) => {
    setAdditionalFeatures((prev) => ({
      ...prev,
      contactDetails: { ...prev.contactDetails, [field]: value },
    }));
    setContactDetailsError((prev) => ({ ...prev, [field]: "" }));
  }, []);

  const handleRefundPolicyChange = useCallback((field: keyof RefundPolicy, value: any) => {
    setAdditionalFeatures((prev) => ({
      ...prev,
      refundPolicy: { ...prev.refundPolicy, [field]: value },
    }));
    setRefundPolicyError((prev) => ({ ...prev, [field]: "" }));
  }, []);

  const handleFaqChange = useCallback((field: keyof FAQ, value: string) => {
    setFaqs((prev) => ({ ...prev, [field]: value }));
    setFaqErrors((prev) => ({ ...prev, [field]: "" }));
  }, []);

  const handleSingleTargetAudienceChange = useCallback((value: string) => {
    setSingleTargetAudience(value);
    setAdditionalFeaturesErrors((prev) => ({ ...prev, targetedAudience: "" }));
  }, []);

  const handleLanguageChange = useCallback((value: string) => {
    setLanguage(value);
    setAdditionalFeaturesErrors((prev) => ({ ...prev, availableLanguages: "" }));
  }, []);

  const handleCertificateTemplateUrlChange = useCallback((value: string) => {
    setAdditionalFeatures((prev) => ({ ...prev, certificateTemplateUrl: value }));
    setAdditionalFeaturesErrors((prev) => ({ ...prev, certificateTemplateUrl: "" }));
  }, []);

  const handleAddFaq = useCallback((faq: FAQ) => {
    setAdditionalFeatures((prev) => ({
      ...prev,
      faqs: [...prev.faqs, faq],
    }));
    setAdditionalFeaturesErrors((prev) => ({ ...prev, faqs: "" }));
    setFaqs({ question: "", answer: "" }); // Reset FAQ input
  }, []);

  const handleAddTargetAudience = useCallback((audience: string) => {
    setAdditionalFeatures((prev) => ({
      ...prev,
      targetAudience: [...prev.targetAudience, audience],
    }));
    setAdditionalFeaturesErrors((prev) => ({ ...prev, targetedAudience: "" }));
  }, []);

  const handleAddLanguage = useCallback((language: string) => {
    setAdditionalFeatures((prev) => ({
      ...prev,
      availableLanguages: [...prev.availableLanguages, language],
    }));
    setAdditionalFeaturesErrors((prev) => ({ ...prev, availableLanguages: "" }));
  }, []);

  const handleRemoveFaq = useCallback((index: number) => {
    setAdditionalFeatures((prev) => ({
      ...prev,
      faqs: prev.faqs.filter((_, i) => i !== index),
    }));
  }, []);

  const handleRemoveTargetAudience = useCallback((index: number) => {
    setAdditionalFeatures((prev) => ({
      ...prev,
      targetAudience: prev.targetAudience.filter((_, i) => i !== index),
    }));
  }, []);

  const handleRemoveLanguage = useCallback((index: number) => {
    setAdditionalFeatures((prev) => ({
      ...prev,
      availableLanguages: prev.availableLanguages.filter((_, i) => i !== index),
    }));
  }, []);

  const handleToggleRefundPolicy = useCallback(() => {
    setAdditionalFeatures((prev) => ({
      ...prev,
      refundPolicy: {
        ...prev.refundPolicy,
        isRefundable: !prev.refundPolicy.isRefundable,
      },
    }));
  }, []);

  // Handlers for ModuleTab
  const handleModuleFieldChange = useCallback((name: keyof Course_Modules, value: any) => {
    setSingleCourseModule((prev) => ({ ...prev, [name]: value }));
    setSingleCourseModuleError((prev) => ({ ...prev, [name]: "" }));
  }, []);

  const handleLearningObjectiveChange = useCallback((value: string) => {
    setLearningObjective(value);
    setSingleCourseModuleError((prev) => ({ ...prev, moduleLearningObjectives: "" }));
  }, []);

  const handleAddLearningObjective = useCallback((objective: string) => {
    setSingleCourseModule((prev) => ({
      ...prev,
      moduleLearningObjectives: [...prev.moduleLearningObjectives, objective],
    }));
    setLearningObjective(""); // Reset input
    setSingleCourseModuleError((prev) => ({ ...prev, moduleLearningObjectives: "" }));
  }, []);

  const handleRemoveLearningObjective = useCallback((index: number) => {
    setSingleCourseModule((prev) => ({
      ...prev,
      moduleLearningObjectives: prev.moduleLearningObjectives.filter((_, i) => i !== index),
    }));
  }, []);

  const handleAddModule = useCallback((module: Course_Modules) => {
    setModules((prev: any) => [...prev, module]);
    setSingleCourseModule({
      moduleTitle: "",
      moduleDescription: "",
      moduleDurationInDays: 1,
      moduleBannerUrl: "",
      notesUrl: "",
      articleUrl: "",
      moduleLearningObjectives: [],
      order: 0,
    });
    setLearningObjective("");
    setSingleCourseModuleError({
      moduleBannerUrl: "",
      moduleDescription: "",
      moduleDurationInDays: "",
      moduleLearningObjectives: "",
      notesUrl: "",
      articleUrl: "",
      moduleTitle: "",
      order: "",
    });
  }, []);

  const handleRemoveModule = useCallback((index: number) => {
    setModules((prev) => prev.filter((_, i) => i !== index));
  }, []);

  // Validation for all tabs
  const validateForm = useCallback(() => {
    let isValid = true;

    // 1. BasicInfoTab validation
    const basicErrors: BasicInfoErrors = {
      courseName: "",
      courseGoals: "",
      courseLevel: "",
      courseDescription: "",
      syllabusOutline: "",
      courseDurationInHours: "",
      courseCategory: "",
      courseSubCategory: "",
      preRequisites: "",
      courseBannerUrl: "",
    };

    if (!basicInformationDetails.courseName.trim()) {
      basicErrors.courseName = "Course name is required";
      isValid = false;
    }
    if (basicInformationDetails.courseGoals.length === 0) {
      basicErrors.courseGoals = "At least one course goal is required";
      isValid = false;
    }
    if (!basicInformationDetails.courseLevel) {
      basicErrors.courseLevel = "Course level is required";
      isValid = false;
    }
    if (!basicInformationDetails.courseDescription.trim()) {
      basicErrors.courseDescription = "Course description is required";
      isValid = false;
    }
    if (basicInformationDetails.syllabusOutline.length === 0) {
      basicErrors.syllabusOutline = "At least one syllabus item is required";
      isValid = false;
    }
    if (basicInformationDetails.courseDurationInHours <= 0) {
      basicErrors.courseDurationInHours = "Duration must be greater than 0";
      isValid = false;
    }
    if (!basicInformationDetails.courseCategory.trim()) {
      basicErrors.courseCategory = "Course category is required";
      isValid = false;
    }
    if (!basicInformationDetails.courseSubCategory.trim()) {
      basicErrors.courseSubCategory = "Course sub-category is required";
      isValid = false;
    }
    if (!basicInformationDetails.courseBannerUrl.trim()) {
      basicErrors.courseBannerUrl = "Course banner URL is required";
      isValid = false;
    } else if (!/^https?:\/\/[^\s$.?#].[^\s]*$/.test(basicInformationDetails.courseBannerUrl)) {
      basicErrors.courseBannerUrl = "Invalid URL format";
      isValid = false;
    }
    setBasicInformationErrors(basicErrors);

    // 2. PricingAndOfferTab validation
    const pricingErrors: PricingAndOfferError = {
      currency: "",
      basePrice: "",
      isCourseOnOffer: "",
      offerDetails: "",
      termsAndConditions: "",
      courseValidityInMonths: "",
    };

    if (!pricingAndOffers.currency) {
      pricingErrors.currency = "Currency is required";
      isValid = false;
    }
    if (pricingAndOffers.basePrice <= 0) {
      pricingErrors.basePrice = "Base price must be greater than 0";
      isValid = false;
    }
    if (!pricingAndOffers.termsAndConditions.trim()) {
      pricingErrors.termsAndConditions = "Terms and conditions are required";
      isValid = false;
    }
    if (pricingAndOffers.courseValidityInMonths <= 0) {
      pricingErrors.courseValidityInMonths = "Course validity must be greater than 0";
      isValid = false;
    }
    if (pricingAndOffers.isCourseOnOffer && pricingAndOffers.offerDetails.length === 0) {
      pricingErrors.offerDetails = "At least one offer is required if course is on offer";
      isValid = false;
    }
    setPricingAndOffersErrors(pricingErrors);

    // Validate all offer details
    const offerErrors: OfferError = {
      offerCode: "",
      offerDescription: "",
      offerSlogan: "",
      discountPercentage: "",
      offerValidity: "",
      offerSeatsAvailable: "",
    };

    let hasOfferErrors = false;
    pricingAndOffers.offerDetails.forEach((offer) => {
      if (!offer.offerCode.trim()) {
        offerErrors.offerCode = "Offer code is required";
        hasOfferErrors = true;
      }
      if (!offer.offerDescription.trim()) {
        offerErrors.offerDescription = "Description is required";
        hasOfferErrors = true;
      }
      if (!offer.offerSlogan.trim()) {
        offerErrors.offerSlogan = "Slogan is required";
        hasOfferErrors = true;
      }
      if (!offer.discountPercentage) {
        offerErrors.discountPercentage = "Discount is required";
        hasOfferErrors = true;
      }
      if (!offer.offerSeatsAvailable) {
        offerErrors.offerSeatsAvailable = "Seats are required";
        hasOfferErrors = true;
      }
      if (!offer.offerValidity) {
        offerErrors.offerValidity = "Validity is required";
        hasOfferErrors = true;
      }
    });

    if (hasOfferErrors) {
      isValid = false;
      setOfferError(offerErrors);
    }

    // 3. SEOAndMarketingTab validation
    const seoErrors: SeoMarketingError = {
      seoMetaTitle: "",
      seoMetaDescription: "",
      tags: "",
      promoVideoUrl: "",
    };

    if (seoAndMarketingData.seoMetaTitle && seoAndMarketingData.seoMetaTitle.length > 60) {
      seoErrors.seoMetaTitle = "Meta title must be 60 characters or less";
      isValid = false;
    }
    if (seoAndMarketingData.seoMetaDescription && seoAndMarketingData.seoMetaDescription.length > 160) {
      seoErrors.seoMetaDescription = "Meta description must be 160 characters or less";
      isValid = false;
    }
    if (seoAndMarketingData.tags.length === 0) {
      seoErrors.tags = "At least one tag is required";
      isValid = false;
    }
    if (
      seoAndMarketingData.promoVideoUrl &&
      !/^https?:\/\/[^\s$.?#].[^\s]*$/.test(seoAndMarketingData.promoVideoUrl)
    ) {
      seoErrors.promoVideoUrl = "Invalid URL format";
      isValid = false;
    }
    setSeoAndMarketingError(seoErrors);

    // Validate single tag field
    if (singleTagField.trim() && singleTagField.length > 50) {
      seoErrors.tags = "Tag must be 50 characters or less";
      isValid = false;
      setSeoAndMarketingError((prev) => ({ ...prev, tags: seoErrors.tags }));
    }

    // 4. AdditionalFeaturesTab validation
    const additionalErrors: AdditionalFeaturesErrors = {
      faqs: "",
      availableLanguages: "",
      targetedAudience: "",
      certificateTemplateUrl: "",
      contactDetails: "",
    };
    const contactErrors: ContactDetailsError = {
      email: "",
      phone: "",
    };
    const refundErrors: RefundPolicyError = {
      refundPeriodDays: "",
      conditions: "",
    };
    const faqInputErrors: FAQErrors = {
      question: "",
      answer: "",
    };

    if (additionalFeatures.faqs.length === 0) {
      additionalErrors.faqs = "At least one FAQ is required";
      isValid = false;
    }
    if (additionalFeatures.availableLanguages.length === 0) {
      additionalErrors.availableLanguages = "At least one language is required";
      isValid = false;
    }
    if (additionalFeatures.targetAudience.length === 0) {
      additionalErrors.targetedAudience = "At least one target audience is required";
      isValid = false;
    }
    if (
      additionalFeatures.certificateTemplateUrl &&
      !/^https?:\/\/[^\s$.?#].[^\s]*$/.test(additionalFeatures.certificateTemplateUrl)
    ) {
      additionalErrors.certificateTemplateUrl = "Invalid URL format";
      isValid = false;
    }
    if (!additionalFeatures.contactDetails.email.trim()) {
      contactErrors.email = "Email is required";
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(additionalFeatures.contactDetails.email)) {
      contactErrors.email = "Invalid email format";
      isValid = false;
    }
    if (!additionalFeatures.contactDetails.phone.trim()) {
      contactErrors.phone = "Phone number is required";
      isValid = false;
    } else if (!/^\+?[1-9]\d{1,14}$/.test(additionalFeatures.contactDetails.phone)) {
      contactErrors.phone = "Invalid phone number format";
      isValid = false;
    }
    if (additionalFeatures.refundPolicy.isRefundable) {
      if (!additionalFeatures.refundPolicy.refundPeriodDays || additionalFeatures.refundPolicy.refundPeriodDays < 1) {
        refundErrors.refundPeriodDays = "Refund period must be at least 1 day";
        isValid = false;
      }
      if (!additionalFeatures.refundPolicy.conditions.trim()) {
        refundErrors.conditions = "Refund conditions are required";
        isValid = false;
      }
    }
    if (faqs.question.trim() || faqs.answer.trim()) {
      if (!faqs.question.trim()) faqInputErrors.question = "Question is required";
      if (!faqs.answer.trim()) faqInputErrors.answer = "Answer is required";
      isValid = false;
    }
    if (singleTargetAudience.trim() && singleTargetAudience.length > 100) {
      additionalErrors.targetedAudience = "Target audience must be 100 characters or less";
      isValid = false;
    }
    if (language.trim() && language.length > 50) {
      additionalErrors.availableLanguages = "Language must be 50 characters or less";
      isValid = false;
    }
    setAdditionalFeaturesErrors(additionalErrors);
    setContactDetailsError(contactErrors);
    setRefundPolicyError(refundErrors);
    setFaqErrors(faqInputErrors);

    // 5. ModuleTab validation
    const moduleErrors: Course_Module_Error = {
      moduleBannerUrl: "",
      moduleDescription: "",
      moduleDurationInDays: "",
      moduleLearningObjectives: "",
      articleUrl: "",
      notesUrl: "",
      moduleTitle: "",
      order: "",
    };

    let hasModuleErrors = false;
    if (modules.length === 0) {
      moduleErrors.moduleTitle = "At least one module is required";
      hasModuleErrors = true;
    } else {
      // Validate uniqueness of module orders
      const orders = modules.map((m) => m.order);
      const uniqueOrders = new Set(orders);
      if (uniqueOrders.size !== orders.length) {
        moduleErrors.order = "Module orders must be unique";
        hasModuleErrors = true;
      }

      // Validate each module
      modules.forEach((module) => {
        if (!module.moduleTitle.trim()) {
          moduleErrors.moduleTitle = "Module title is required";
          hasModuleErrors = true;
        }
        if (!module.moduleDescription.trim()) {
          moduleErrors.moduleDescription = "Module description is required";
          hasModuleErrors = true;
        }
        if (!module.moduleDurationInDays || module.moduleDurationInDays < 1) {
          moduleErrors.moduleDurationInDays = "Duration must be at least 1 day";
          hasModuleErrors = true;
        }
        if (module.moduleBannerUrl && !/^https?:\/\/[^\s$.?#].[^\s]*$/.test(module.moduleBannerUrl)) {
          moduleErrors.moduleBannerUrl = "Invalid URL format";
          hasModuleErrors = true;
        }
        if (module.moduleLearningObjectives.length === 0) {
          moduleErrors.moduleLearningObjectives = "At least one learning objective is required";
          hasModuleErrors = true;
        }
        if (module.order < 0) {
          moduleErrors.order = "Order must be non-negative";
          hasModuleErrors = true;
        }
      });
    }

    if (hasModuleErrors) {
      isValid = false;
      setSingleCourseModuleError(moduleErrors);
    }

    // Validate learning objective input (for the current input, not saved modules)
    if (learningObjective.trim() && learningObjective.length > 100) {
      moduleErrors.moduleLearningObjectives = "Learning objective must be 100 characters or less";
      isValid = false;
      setSingleCourseModuleError((prev) => ({
        ...prev,
        moduleLearningObjectives: moduleErrors.moduleLearningObjectives,
      }));
    }

    return isValid;
  }, [
    basicInformationDetails,
    pricingAndOffers,
    seoAndMarketingData,
    singleTagField,
    additionalFeatures,
    faqs,
    singleTargetAudience,
    language,
    modules,
    learningObjective,
  ]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isValid = validateForm();

    if (!isValid) {
      // Find the first tab with errors
      const errorTabs = [];
      if (Object.values(basicInformationErrors).some((err) => err)) errorTabs.push("BasicDetails");
      if (
        Object.values(pricingAndOffersErrors).some((err) => err) ||
        Object.values(offerError).some((err) => err)
      )
        errorTabs.push("PricingAndOffer");
      if (Object.values(seoAndMarketingError).some((err) => err)) errorTabs.push("SEOAndMarketing");
      if (
        Object.values(additionalFeaturesErrors).some((err) => err) ||
        Object.values(contactDetailsError).some((err) => err) ||
        Object.values(refundPolicyError).some((err) => err) ||
        Object.values(faqErrors).some((err) => err)
      )
        errorTabs.push("AdditionalInformation");
      if (Object.values(singleCourseModuleError).some((err) => err)) errorTabs.push("ContentModule");

      // Switch to the first tab with errors
      if (errorTabs.length > 0) {
        setSelectedTab(errorTabs[0]);
      }

      return;
    }

    setIsSubmitting(false);
    try {
      // Combine data from all tabs
      const courseData = {
        instructorId:admin?._id,
        basicInfo: basicInformationDetails,
        pricingAndOffers: {
          ...pricingAndOffers,
          offerDetails: pricingAndOffers.offerDetails.map((offer) => ({
            ...offer,
            offerValidity: offer.offerValidity.toISOString(), // Convert Date to string for storage
          })),
        },
        seoAndMarketing: seoAndMarketingData,
        additionalFeatures,
        modules,
      };

      console.log(courseData);
      // Clear localStorage after successful submission

      // return;
      const response = await fetch("/api/courses/create-online-course", {
        method: "POST",
        credentials: "include",
        body: JSON.stringify(courseData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData);
      }
      const data = await response.json();
      console.log(data);
      router.back();
    } catch (error) {
      console.error("Submission error:", error);
      alert("Failed to submit course. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Memoized tab content
  const tabContent = useMemo(
    () => ({
      BasicDetails: (
        <BasicInfoTab
          details={basicInformationDetails}
          detailsErrors={basicInformationErrors}
          singleSyllabusOutline={singleSyllabusOutline}
          onSyllabusOutlineChange={setSingleSyllabusOutline}
          onCourseGoalsChange={setSingleCourseGoals}
          onSinglePreRequisitesChange={setSinglePreRequisites}
          singleCourseGoals={singleCourseGoals}
          singlePreRequisites={singlePreRequisites}
          onDetailsChange={handleOnDetailChange}
          onAddPreRequisites={handleAddPreRequisites}
          onAddSyllabusOutline={handleAddSyllabusOutline}
          onAddCourseGoals={handleAddCourseGoals}
          onRemoveCourseGoals={handleRemoveCourseGoals}
          onRemovePreRequisites={handleRemovePreRequisites}
          onRemoveSyllabusOutline={handleRemoveSyllabusOutline}
        />
      ),
      PricingAndOffer: (
        <PricingAndOfferTab
          pricingAndOffers={pricingAndOffers}
          pricingAndOffersErrors={pricingAndOffersErrors}
          newOfferDetail={newOfferDetail}
          offerError={offerError}
          worldCurrencies={worldCurrencies}
          onPricingAndOfferChange={handlePricingAndOfferChange}
          onNewOfferDetailChange={handleNewOfferDetailChange}
          onAddOfferDetail={handleAddOfferDetail}
          onRemoveOfferDetail={handleRemoveOfferDetail}
          onOfferValidityChange={handleOfferValidityChange}
        />
      ),
      SEOAndMarketing: (
        <SEOAndMarketingTab
          seoAndMarketingData={seoAndMarketingData}
          seoAndMarketingError={seoAndMarketingError}
          singleTagField={singleTagField}
          onSEOAndMarketingChange={handleSEOAndMarketingChange}
          onSingleTagChange={handleSingleTagChange}
          onAddTag={handleAddTag}
          onRemoveTag={handleRemoveTag}
        />
      ),
      "Additional Information": (
        <AdditionalFeaturesTab
          additionalFeatures={additionalFeatures}
          additionalFeaturesErrors={additionalFeaturesErrors}
          contactDetailsError={contactDetailsError}
          refundPolicyError={refundPolicyError}
          faqErrors={faqErrors}
          singleTargetAudience={singleTargetAudience}
          language={language}
          faqs={faqs}
          onContactDetailsChange={handleContactDetailsChange}
          onRefundPolicyChange={handleRefundPolicyChange}
          onFaqChange={handleFaqChange}
          onSingleTargetAudienceChange={handleSingleTargetAudienceChange}
          onLanguageChange={handleLanguageChange}
          onCertificateTemplateUrlChange={handleCertificateTemplateUrlChange}
          onAddFaq={handleAddFaq}
          onAddTargetAudience={handleAddTargetAudience}
          onAddLanguage={handleAddLanguage}
          onRemoveFaq={handleRemoveFaq}
          onRemoveTargetAudience={handleRemoveTargetAudience}
          onRemoveLanguage={handleRemoveLanguage}
          onToggleRefundPolicy={handleToggleRefundPolicy}
        />
      ),
      ContentModule: (
        <ModuleTab
          modules={modules}
          singleCourseModule={singleCourseModule}
          singleCourseModuleError={singleCourseModuleError}
          learningObjective={learningObjective}
          onModuleFieldChange={handleModuleFieldChange}
          onLearningObjectiveChange={handleLearningObjectiveChange}
          onAddLearningObjective={handleAddLearningObjective}
          onRemoveLearningObjective={handleRemoveLearningObjective}
          onAddModule={handleAddModule}
          onRemoveModule={handleRemoveModule}
        />
      ),
    }),
    [
      basicInformationDetails,
      basicInformationErrors,
      singleSyllabusOutline,
      singleCourseGoals,
      singlePreRequisites,
      handleOnDetailChange,
      handleAddPreRequisites,
      handleAddSyllabusOutline,
      handleAddCourseGoals,
      handleRemoveCourseGoals,
      handleRemovePreRequisites,
      handleRemoveSyllabusOutline,
      pricingAndOffers,
      pricingAndOffersErrors,
      newOfferDetail,
      offerError,
      handlePricingAndOfferChange,
      handleNewOfferDetailChange,
      handleAddOfferDetail,
      handleRemoveOfferDetail,
      handleOfferValidityChange,
      seoAndMarketingData,
      seoAndMarketingError,
      singleTagField,
      handleSEOAndMarketingChange,
      handleSingleTagChange,
      handleAddTag,
      handleRemoveTag,
      additionalFeatures,
      additionalFeaturesErrors,
      contactDetailsError,
      refundPolicyError,
      faqErrors,
      singleTargetAudience,
      language,
      faqs,
      handleContactDetailsChange,
      handleRefundPolicyChange,
      handleFaqChange,
      handleSingleTargetAudienceChange,
      handleLanguageChange,
      handleCertificateTemplateUrlChange,
      handleAddFaq,
      handleAddTargetAudience,
      handleAddLanguage,
      handleRemoveFaq,
      handleRemoveTargetAudience,
      handleRemoveLanguage,
      handleToggleRefundPolicy,
      modules,
      singleCourseModule,
      singleCourseModuleError,
      learningObjective,
      handleModuleFieldChange,
      handleLearningObjectiveChange,
      handleAddLearningObjective,
      handleRemoveLearningObjective,
      handleAddModule,
      handleRemoveModule,
    ]
  );

  return (
    <>
    <Head>
        <title>Create New Online Course | IIMs</title>
        <meta
          name="description"
          content="Create and manage online courses with comprehensive details, pricing, SEO, and batch information."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta property="og:title" content="Create New Offline Course | Your Platform Name" />
        <meta
          property="og:description"
          content="Create and manage online courses with comprehensive details, pricing, SEO, and batch information."
        />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Create New Online Course | IIMs" />
        <meta
          name="twitter:description"
          content="Create and manage online courses with comprehensive details, pricing, SEO, and batch information."
        />
      </Head>

    <div className="min-h-screen py-8 flex items-center justify-center bg-gradient-to-br from-orange-200 via-orange-300 to-orange-400 dark:from-stone-800 dark:via-stone-900 dark:to-black">
      <form onSubmit={handleSubmit} className="w-full max-w-5xl" noValidate>
        <div>
          <div className="flex border-b border-stone-200 dark:border-stone-700 mb-6" role="tablist">
            {tabs.map((tab) => (
              <button
                key={tab}
                type="button"
                id={`${tab.replace(/\s+/g, "-").toLowerCase()}-tab`}
                onClick={() => setSelectedTab(tab)}
                className={`px-4 py-2 font-medium transition-colors duration-200 ${
                  selectedTab === tab
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

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full p-3 mt-6 bg-orange-600 text-stone-100 dark:text-stone-900 rounded font-bold transition-opacity duration-200 ${
            isSubmitting ? "opacity-50 cursor-not-allowed" : "hover:bg-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
          }`}
          aria-label={isSubmitting ? "Submitting course" : "Submit course"}
        >
          {isSubmitting ? "Submitting..." : "Submit Course"}
        </button>
      </form>
    </div>
    </>
  );
}