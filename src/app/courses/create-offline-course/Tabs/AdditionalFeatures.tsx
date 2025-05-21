import React, { useCallback, useMemo } from "react";
import {
  PiBoundingBox,
  PiClock,
  PiEnvelope,
  PiPhone,
  PiPlus,
  PiQuestion,
  PiTextAa,
  PiToolbox,
  PiTrash,
  PiUsers,
  PiWarning,
} from "react-icons/pi";
import { IoAccessibility } from "react-icons/io5";

// Define interfaces
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
  termsAndCondition: string;
}

interface AdditionalFeaturesTabProps {
  additionalFeatures: I_Offline_Course_Additional_Features;
  additionalFeaturesErrors: AdditionalFeaturesErrors;
  contactDetailsError: ContactDetailsError;
  refundPolicyError: RefundPolicyError;
  faqErrors: FAQErrors;
  singleTargetAudience: string;
  language: string;
  providedMaterials: string;
  requiredEquipments: string;
  accessibilityFeatures: string;
  faqs: FAQ;
  onContactDetailsChange: (field: keyof ContactDetails, value: string) => void;
  onRefundPolicyChange: (field: keyof RefundPolicy, value: any) => void;
  onFaqChange: (field: keyof FAQ, value: string) => void;
  onSingleTargetAudienceChange: (value: string) => void;
  onLanguageChange: (value: string) => void;
  onProvidedMaterialsChange: (value: string) => void;
  onRequiredEquipmentsChange: (value: string) => void;
  onAccessibilityFeaturesChange: (value: string) => void;
  onTermsAndConditionChange: (value: string) => void; // Added handler
  onAddFaq: (faq: FAQ) => void;
  onAddTargetAudience: (audience: string) => void;
  onAddLanguage: (language: string) => void;
  onAddProvidedMaterials: (material: string) => void;
  onAddRequiredEquipments: (equipment: string) => void;
  onAddAccessibilityFeatures: (feature: string) => void;
  onRemoveFaq: (index: number) => void;
  onRemoveTargetAudience: (index: number) => void;
  onRemoveLanguage: (index: number) => void;
  onRemoveProvidedMaterials: (index: number) => void;
  onRemoveRequiredEquipments: (index: number) => void;
  onRemoveAccessibilityFeatures: (index: number) => void;
  onToggleRefundPolicy: () => void;
}

export function AdditionalFeaturesTab({
  additionalFeatures,
  additionalFeaturesErrors,
  contactDetailsError,
  refundPolicyError,
  faqErrors,
  singleTargetAudience,
  language,
  providedMaterials,
  requiredEquipments,
  accessibilityFeatures,
  faqs,
  onContactDetailsChange,
  onRefundPolicyChange,
  onFaqChange,
  onSingleTargetAudienceChange,
  onLanguageChange,
  onProvidedMaterialsChange,
  onRequiredEquipmentsChange,
  onAccessibilityFeaturesChange,
  onTermsAndConditionChange, // Added to props
  onAddFaq,
  onAddTargetAudience,
  onAddLanguage,
  onAddProvidedMaterials,
  onAddRequiredEquipments,
  onAddAccessibilityFeatures,
  onRemoveFaq,
  onRemoveTargetAudience,
  onRemoveLanguage,
  onRemoveProvidedMaterials,
  onRemoveRequiredEquipments,
  onRemoveAccessibilityFeatures,
  onToggleRefundPolicy,
}: AdditionalFeaturesTabProps) {
  // Handlers for adding items
  const handleAddFaq = useCallback(() => {
    onAddFaq(faqs);
  }, [faqs, onAddFaq]);

  const handleAddTargetAudience = useCallback(() => {
    const trimmed = singleTargetAudience.trim();
    if (trimmed) {
      onAddTargetAudience(trimmed);
    }
  }, [singleTargetAudience, onAddTargetAudience]);

  const handleAddLanguage = useCallback(() => {
    const trimmed = language.trim();
    if (trimmed) {
      onAddLanguage(trimmed);
    }
  }, [language, onAddLanguage]);

  const handleAddProvidedMaterials = useCallback(() => {
    const trimmed = providedMaterials.trim();
    if (trimmed) {
      onAddProvidedMaterials(trimmed);
    }
  }, [providedMaterials, onAddProvidedMaterials]);

  const handleAddRequiredEquipments = useCallback(() => {
    const trimmed = requiredEquipments.trim();
    if (trimmed) {
      onAddRequiredEquipments(trimmed);
    }
  }, [requiredEquipments, onAddRequiredEquipments]);

  const handleAddAccessibilityFeatures = useCallback(() => {
    const trimmed = accessibilityFeatures.trim();
    if (trimmed) {
      onAddAccessibilityFeatures(trimmed);
    }
  }, [accessibilityFeatures, onAddAccessibilityFeatures]);

  const AdditionalFeaturesTab = useMemo(
    () => (
      <div className="w-[64rem] space-y-6">
        <h1 className="text-4xl font-bold text-orange-600 text-shadow-xl">
          Additional Features
        </h1>

        {/* Target Audience */}
        <div className="space-y-1 w-full">
          <label className="text-orange-600 font-bold" htmlFor="singleTargetAudience">
            Add Target Audience
          </label>
          <div className="flex w-full gap-4">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <PiUsers className="h-5 w-5 text-stone-400" />
              </div>
              <input
                name="singleTargetAudience"
                id="singleTargetAudience"
                type="text"
                value={singleTargetAudience}
                onChange={(e) => onSingleTargetAudienceChange(e.target.value)}
                className={`pl-10 outline-none w-full rounded-lg border ${
                  additionalFeaturesErrors.targetedAudience
                    ? "border-red-500"
                    : singleTargetAudience
                    ? "border-orange-500"
                    : "border-stone-300 dark:border-stone-700"
                } bg-stone-100 dark:bg-stone-800 py-2 px-3 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                placeholder="e.g., Beginners, Professionals"
                maxLength={500}
                aria-invalid={!!additionalFeaturesErrors.targetedAudience}
                aria-describedby="targeted-audience-error"
              />
            </div>
            <button
              type="button"
              onClick={handleAddTargetAudience}
              className="flex rounded items-center gap-4 px-4 font-bold py-2 bg-orange-600 text-stone-100 dark:text-stone-900"
            >
              <PiPlus /> Add
            </button>
          </div>
          <div aria-live="polite">
            {additionalFeaturesErrors.targetedAudience && (
              <p
                id="targeted-audience-error"
                className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
              >
                <PiWarning size={16} /> {additionalFeaturesErrors.targetedAudience}
              </p>
            )}
          </div>
          <div className="flex mt-4 flex-col gap-2">
            <span className="text-orange-600">Your Audiences:</span>
            <ul className="space-y-4">
              {additionalFeatures.targetAudience.map((audience, index) => (
                <li
                  key={index}
                  className="w-full text-orange-600 rounded-full px-4 flex items-center justify-between py-2 shadow-sm shadow-stone-500 bg-stone-100/50 dark:bg-stone-800"
                >
                  <span>{audience}</span>
                  <button
                    type="button"
                    onClick={() => onRemoveTargetAudience(index)}
                    className="text-red-600 hover:text-red-800"
                    aria-label={`Remove ${audience}`}
                  >
                    <PiTrash />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Available Languages */}
        <div className="space-y-1 w-full">
          <label className="text-orange-600 font-bold" htmlFor="language">
            Add Available Languages
          </label>
          <div className="flex w-full gap-4">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <PiTextAa className="h-5 w-5 text-stone-400" />
              </div>
              <input
                name="language"
                id="language"
                type="text"
                value={language}
                onChange={(e) => onLanguageChange(e.target.value)}
                className={`pl-10 outline-none w-full rounded-lg border ${
                  additionalFeaturesErrors.availableLanguages
                    ? "border-red-500"
                    : language
                    ? "border-orange-500"
                    : "border-stone-300 dark:border-stone-700"
                } bg-stone-100 dark:bg-stone-800 py-2 px-3 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                placeholder="e.g., English, Spanish"
                maxLength={50}
                aria-invalid={!!additionalFeaturesErrors.availableLanguages}
                aria-describedby="course-language-error"
              />
            </div>
            <button
              type="button"
              onClick={handleAddLanguage}
              className="flex rounded items-center gap-4 px-4 font-bold py-2 bg-orange-600 text-stone-100 dark:text-stone-900"
            >
              <PiPlus /> Add
            </button>
          </div>
          <div aria-live="polite">
            {additionalFeaturesErrors.availableLanguages && (
              <p
                id="course-language-error"
                className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
              >
                <PiWarning size={16} /> {additionalFeaturesErrors.availableLanguages}
              </p>
            )}
          </div>
          <div className="flex mt-4 flex-col gap-2">
            <span className="text-orange-600">Available Languages:</span>
            <ul className="space-y-2 flex gap-4 items-center justify-center">
              {additionalFeatures.availableLanguages.map((lang, index) => (
                <li
                  key={index}
                  className="w-full text-orange-600 rounded-full px-4 flex items-center justify-between py-2 shadow-sm shadow-stone-500 bg-stone-100/50 dark:bg-stone-800"
                >
                  <span>{lang}</span>
                  <button
                    type="button"
                    onClick={() => onRemoveLanguage(index)}
                    className="text-red-600 hover:text-red-800"
                    aria-label={`Remove ${lang}`}
                  >
                    <PiTrash />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Provided Materials */}
        <div className="space-y-1 w-full">
          <label className="text-orange-600 font-bold" htmlFor="providedMaterials">
            Add Provided Materials
          </label>
          <div className="flex w-full gap-4">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <PiBoundingBox className="h-5 w-5 text-stone-400" />
              </div>
              <input
                name="providedMaterials"
                id="providedMaterials"
                type="text"
                value={providedMaterials}
                onChange={(e) => onProvidedMaterialsChange(e.target.value)}
                className={`pl-10 outline-none w-full rounded-lg border ${
                  additionalFeaturesErrors.materialProvided
                    ? "border-red-500"
                    : providedMaterials
                    ? "border-orange-500"
                    : "border-stone-300 dark:border-stone-700"
                } bg-stone-100 dark:bg-stone-800 py-2 px-3 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                placeholder="e.g., Textbook, Software License"
                maxLength={500}
                aria-invalid={!!additionalFeaturesErrors.materialProvided}
                aria-describedby="material-provided-error"
              />
            </div>
            <button
              type="button"
              onClick={handleAddProvidedMaterials}
              className="flex rounded items-center gap-4 px-4 font-bold py-2 bg-orange-600 text-stone-100 dark:text-stone-900"
            >
              <PiPlus /> Add
            </button>
          </div>
          <div aria-live="polite">
            {additionalFeaturesErrors.materialProvided && (
              <p
                id="material-provided-error"
                className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
              >
                <PiWarning size={16} /> {additionalFeaturesErrors.materialProvided}
              </p>
            )}
          </div>
          <div className="flex mt-4 flex-col gap-2">
            <span className="text-orange-600">Provided Materials:</span>
            <ul className="space-y-2 flex flex-wrap items-start justify-start gap-4">
              {additionalFeatures.materialsProvided.map((material, index) => (
                <li
                  key={index}
                  className="w-full text-orange-600 rounded-full px-4 flex items-center justify-between py-2 shadow-sm shadow-stone-500 bg-stone-100/50 dark:bg-stone-800"
                >
                  <span>{material}</span>
                  <button
                    type="button"
                    onClick={() => onRemoveProvidedMaterials(index)}
                    className="text-red-600 hover:text-red-800"
                    aria-label={`Remove ${material}`}
                  >
                    <PiTrash />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Required Equipment */}
        <div className="space-y-1 w-full">
          <label className="text-orange-600 font-bold" htmlFor="requiredEquipments">
            Add Required Equipment
          </label>
          <div className="flex w-full gap-4">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <PiToolbox className="h-5 w-5 text-stone-400" />
              </div>
              <input
                name="requiredEquipments"
                id="requiredEquipments"
                type="text"
                value={requiredEquipments}
                onChange={(e) => onRequiredEquipmentsChange(e.target.value)}
                className={`pl-10 outline-none w-full rounded-lg border ${
                  additionalFeaturesErrors.equipmentRequired
                    ? "border-red-500"
                    : requiredEquipments
                    ? "border-orange-500"
                    : "border-stone-300 dark:border-stone-700"
                } bg-stone-100 dark:bg-stone-800 py-2 px-3 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                placeholder="e.g., Laptop, Webcam"
                maxLength={500}
                aria-invalid={!!additionalFeaturesErrors.equipmentRequired}
                aria-describedby="equipment-required-error"
              />
            </div>
            <button
              type="button"
              onClick={handleAddRequiredEquipments}
              className="flex rounded items-center gap-4 px-4 font-bold py-2 bg-orange-600 text-stone-100 dark:text-stone-900"
            >
              <PiPlus /> Add
            </button>
          </div>
          <div aria-live="polite">
            {additionalFeaturesErrors.equipmentRequired && (
              <p
                id="equipment-required-error"
                className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
              >
                <PiWarning size={16} /> {additionalFeaturesErrors.equipmentRequired}
              </p>
            )}
          </div>
          <div className="flex mt-4 flex-col gap-2">
            <span className="text-orange-600">Required Equipment:</span>
            <ul className="space-y-2 flex gap-4 flex-wrap">
              {additionalFeatures.equipmentRequired.map((equipment, index) => (
                <li
                  key={index}
                  className="w-full text-orange-600 rounded-full px-4 flex items-center justify-between py-2 shadow-sm shadow-stone-500 bg-stone-100/50 dark:bg-stone-800"
                >
                  <span>{equipment}</span>
                  <button
                    type="button"
                    onClick={() => onRemoveRequiredEquipments(index)}
                    className="text-red-600 hover:text-red-800"
                    aria-label={`Remove ${equipment}`}
                  >
                    <PiTrash />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Accessibility Features */}
        <div className="space-y-1 w-full">
          <label className="text-orange-600 font-bold" htmlFor="accessibilityFeatures">
            Add Accessibility Features
          </label>
          <div className="flex w-full gap-4">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <IoAccessibility className="h-5 w-5 text-stone-400" />
              </div>
              <input
                name="accessibilityFeatures"
                id="accessibilityFeatures"
                type="text"
                value={accessibilityFeatures}
                onChange={(e) => onAccessibilityFeaturesChange(e.target.value)}
                className={`pl-10 outline-none w-full rounded-lg border ${
                  additionalFeaturesErrors.accessibilityFeatures
                    ? "border-red-500"
                    : accessibilityFeatures
                    ? "border-orange-500"
                    : "border-stone-300 dark:border-stone-700"
                } bg-stone-100 dark:bg-stone-800 py-2 px-3 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                placeholder="e.g., Subtitles, Screen Reader Support"
                maxLength={500}
                aria-invalid={!!additionalFeaturesErrors.accessibilityFeatures}
                aria-describedby="accessibility-error"
              />
            </div>
            <button
              type="button"
              onClick={handleAddAccessibilityFeatures}
              className="flex rounded items-center gap-4 px-4 font-bold py-2 bg-orange-600 text-stone-100 dark:text-stone-900"
            >
              <PiPlus /> Add
            </button>
          </div>
          <div aria-live="polite">
            {additionalFeaturesErrors.accessibilityFeatures && (
              <p
                id="accessibility-error"
                className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
              >
                <PiWarning size={16} /> {additionalFeaturesErrors.accessibilityFeatures}
              </p>
            )}
          </div>
          <div className="flex mt-4 flex-col gap-2">
            <span className="text-orange-600">Accessibility Features:</span>
            <ul className="space-y-2 flex flex-wrap gap-4">
              {additionalFeatures.accessibilityFeatures.map((feature, index) => (
                <li
                  key={index}
                  className="w-full text-orange-600 rounded-full px-4 flex items-center justify-between py-2 shadow-sm shadow-stone-500 bg-stone-100/50 dark:bg-stone-800"
                >
                  <span>{feature}</span>
                  <button
                    type="button"
                    onClick={() => onRemoveAccessibilityFeatures(index)}
                    className="text-red-600 hover:text-red-800"
                    aria-label={`Remove ${feature}`}
                  >
                    <PiTrash />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Contact Details */}
        <div className="space-y-2">
          <span className="text-2xl font-bold text-orange-600">Contact Details</span>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-1">
              <label htmlFor="email" className="text-orange-600 font-bold">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <PiEnvelope className="h-5 w-5 text-stone-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={additionalFeatures.contactDetails.email}
                  onChange={(e) => onContactDetailsChange("email", e.target.value)}
                  className={`pl-10 outline-none w-full rounded-lg border ${
                    contactDetailsError.email
                      ? "border-red-500"
                      : additionalFeatures.contactDetails.email
                      ? "border-orange-500"
                      : "border-stone-300 dark:border-stone-700"
                  } bg-stone-100 dark:bg-stone-800 py-2 px-3 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                  placeholder="e.g., johndoe@email.com"
                  maxLength={500}
                  aria-invalid={!!contactDetailsError.email}
                  aria-describedby="email-error"
                  aria-required="true"
                />
              </div>
              <div aria-live="polite">
                {contactDetailsError.email && (
                  <p
                    id="email-error"
                    className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
                  >
                    <PiWarning size={16} /> {contactDetailsError.email}
                  </p>
                )}
              </div>
            </div>
            <div className="space-y-1">
              <label htmlFor="phone" className="text-orange-600 font-bold">
                Phone
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <PiPhone className="h-5 w-5 text-stone-400" />
                </div>
                <input
                  id="phone"
                  name="phone"
                  type="text"
                  value={additionalFeatures.contactDetails.phone}
                  onChange={(e) => onContactDetailsChange("phone", e.target.value)}
                  className={`pl-10 outline-none w-full rounded-lg border ${
                    contactDetailsError.phone
                      ? "border-red-500"
                      : additionalFeatures.contactDetails.phone
                      ? "border-orange-500"
                      : "border-stone-300 dark:border-stone-700"
                  } bg-stone-100 dark:bg-stone-800 py-2 px-3 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                  placeholder="e.g., +1234567890"
                  maxLength={15}
                  aria-invalid={!!contactDetailsError.phone}
                  aria-describedby="phone-error"
                  aria-required="true"
                />
              </div>
              <div aria-live="polite">
                {contactDetailsError.phone && (
                  <p
                    id="phone-error"
                    className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
                  >
                    <PiWarning size={16} /> {contactDetailsError.phone}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* FAQs */}
        <div className="space-y-4">
          <span className="text-2xl font-bold text-orange-600">Frequently Asked Questions</span>
          <div className="grid grid-cols-9 items-center gap-6">
            <div className="space-y-1 col-span-4">
              <label htmlFor="question" className="text-orange-600 font-bold">
                Question
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <PiQuestion className="h-5 w-5 text-stone-400" />
                </div>
                <input
                  id="question"
                  name="question"
                  type="text"
                  value={faqs.question}
                  onChange={(e) => onFaqChange("question", e.target.value)}
                  className={`pl-10 outline-none w-full rounded-lg border ${
                    faqErrors.question
                      ? "border-red-500"
                      : faqs.question
                      ? "border-orange-500"
                      : "border-stone-300 dark:border-stone-700"
                  } bg-stone-100 dark:bg-stone-800 py-2 px-3 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                  placeholder="e.g., What is covered in this course?"
                  maxLength={500}
                  aria-invalid={!!faqErrors.question}
                  aria-describedby="faq-question-error"
                />
              </div>
              <div aria-live="polite">
                {faqErrors.question && (
                  <p
                    id="faq-question-error"
                    className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
                  >
                    <PiWarning size={16} /> {faqErrors.question}
                  </p>
                )}
              </div>
              <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
                {faqs.question.length}/100 characters
              </p>
            </div>
            <div className="space-y-1 col-span-4">
              <label htmlFor="answer" className="text-orange-600 font-bold">
                Answer
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <PiTextAa className="h-5 w-5 text-stone-400" />
                </div>
                <input
                  id="answer"
                  name="answer"
                  type="text"
                  value={faqs.answer}
                  onChange={(e) => onFaqChange("answer", e.target.value)}
                  className={`pl-10 outline-none w-full rounded-lg border ${
                    faqErrors.answer
                      ? "border-red-500"
                      : faqs.answer
                      ? "border-orange-500"
                      : "border-stone-300 dark:border-stone-700"
                  } bg-stone-100 dark:bg-stone-800 py-2 px-3 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                  placeholder="e.g., This course covers..."
                  maxLength={500}
                  aria-invalid={!!faqErrors.answer}
                  aria-describedby="faq-answer-error"
                />
              </div>
              <div aria-live="polite">
                {faqErrors.answer && (
                  <p
                    id="faq-answer-error"
                    className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
                  >
                    <PiWarning size={16} /> {faqErrors.answer}
                  </p>
                )}
              </div>
              <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
                {faqs.answer.length}/200 characters
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddFaq}
              className="flex rounded items-center gap-4 px-4 font-bold py-2 bg-orange-600 text-stone-100 dark:text-stone-900"
            >
              <PiPlus /> Add
            </button>
          </div>
          <div className="flex flex-col">
            <span className="text-orange-600 font-bold py-4">Your Added FAQs:</span>
            <ul className="space-y-2">
              {additionalFeatures.faqs.map((faq, index) => (
                <li
                  key={index}
                  className="flex items-center justify-between text-orange-600"
                >
                  <details className="w-full">
                    <summary className="cursor-pointer">{faq.question}</summary>
                    <p className="mt-2">{faq.answer}</p>
                  </details>
                  <button
                    type="button"
                    onClick={() => onRemoveFaq(index)}
                    className="text-red-600 hover:text-red-800"
                    aria-label={`Remove FAQ: ${faq.question}`}
                  >
                    <PiTrash />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Refund Policy */}
        <div className="space-y-2">
          <label className="flex items-center gap-5">
            <input
              type="checkbox"
              checked={additionalFeatures.refundPolicy.isRefundable}
              onChange={onToggleRefundPolicy}
              className="h-5 w-5 accent-orange-600"
            />
            <span className="text-orange-600 font-bold">Is There a Refund Policy?</span>
          </label>
          {additionalFeatures.refundPolicy.isRefundable && (
            <div className="space-y-2">
              <div className="space-y-1">
                <label className="text-orange-600 font-bold" htmlFor="refundPeriodDays">
                  Refund Period (Days)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <PiClock className="h-5 w-5 text-stone-400" />
                  </div>
                  <input
                    id="refundPeriodDays"
                    name="refundPeriodDays"
                    type="number"
                    min="1"
                    max="30"
                    value={additionalFeatures.refundPolicy.refundPeriodDays || ""}
                    onChange={(e) => onRefundPolicyChange("refundPeriodDays", e.target.value)}
                    className={`pl-10 outline-none w-full rounded-lg border ${
                      refundPolicyError.refundPeriodDays
                        ? "border-red-500"
                        : additionalFeatures.refundPolicy.refundPeriodDays
                        ? "border-orange-500"
                        : "border-stone-300 dark:border-stone-700"
                    } bg-stone-100 dark:bg-stone-800 py-2 px-3 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                    placeholder="e.g., 10"
                    aria-invalid={!!refundPolicyError.refundPeriodDays}
                    aria-describedby="refund-period-day-error"
                    aria-required="true"
                  />
                </div>
                <div aria-live="polite">
                  {refundPolicyError.refundPeriodDays && (
                    <p
                      id="refund-period-day-error"
                      className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
                    >
                      <PiWarning size={16} /> {refundPolicyError.refundPeriodDays}
                    </p>
                  )}
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-orange-600 font-bold" htmlFor="conditions">
                  Refund Conditions
                </label>
                <textarea
                  id="conditions"
                  name="conditions"
                  value={additionalFeatures.refundPolicy.conditions}
                  onChange={(e) => onRefundPolicyChange("conditions", e.target.value)}
                  className={`w-full rounded-lg border ${
                    refundPolicyError.conditions
                      ? "border-red-500"
                      : additionalFeatures.refundPolicy.conditions
                      ? "border-orange-500"
                      : "border-stone-300 dark:border-stone-700"
                  } bg-stone-100 dark:bg-stone-800 py-2 px-3 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent min-h-[100px]`}
                  placeholder="e.g., Full refund within 10 days if course not started"
                  maxLength={500}
                  aria-invalid={!!refundPolicyError.conditions}
                  aria-describedby="refund-conditions-error"
                  aria-required="true"
                />
                <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
                  {additionalFeatures.refundPolicy.conditions.length}/500 characters
                </p>
                <div aria-live="polite">
                  {refundPolicyError.conditions && (
                    <p
                      id="refund-conditions-error"
                      className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
                    >
                      <PiWarning size={16} /> {refundPolicyError.conditions}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Terms and Conditions */}
        <div className="space-y-1">
          <label className="text-orange-600 font-bold" htmlFor="termsAndCondition">
            Terms and Conditions
          </label>
          <textarea
            id="termsAndCondition"
            name="termsAndCondition"
            value={additionalFeatures.termsAndCondition}
            onChange={(e) => onTermsAndConditionChange(e.target.value)}
            className={`w-full rounded-lg border ${
              additionalFeaturesErrors.termsAndCondition
                ? "border-red-500"
                : additionalFeatures.termsAndCondition
                ? "border-orange-500"
                : "border-stone-300 dark:border-stone-700"
            } bg-stone-100 dark:bg-stone-800 py-2 px-3 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent min-h-[100px]`}
            placeholder="e.g., By enrolling in this course, you agree to..."
            maxLength={1000}
            aria-invalid={!!additionalFeaturesErrors.termsAndCondition}
            aria-describedby="terms-and-condition-error"
            aria-required="true"
          />
          <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
            {additionalFeatures?.termsAndCondition?.length}/1000 characters
          </p>
          <div aria-live="polite">
            {additionalFeaturesErrors.termsAndCondition && (
              <p
                id="terms-and-condition-error"
                className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
              >
                <PiWarning size={16} /> {additionalFeaturesErrors.termsAndCondition}
              </p>
            )}
          </div>
        </div>
      </div>
    ),
    [
      additionalFeatures,
      additionalFeaturesErrors,
      contactDetailsError,
      refundPolicyError,
      faqErrors,
      singleTargetAudience,
      language,
      providedMaterials,
      requiredEquipments,
      accessibilityFeatures,
      faqs,
      onContactDetailsChange,
      onRefundPolicyChange,
      onFaqChange,
      onSingleTargetAudienceChange,
      onLanguageChange,
      onProvidedMaterialsChange,
      onRequiredEquipmentsChange,
      onAccessibilityFeaturesChange,
      onTermsAndConditionChange, // Added to useMemo dependencies
      handleAddFaq,
      handleAddTargetAudience,
      handleAddLanguage,
      handleAddProvidedMaterials,
      handleAddRequiredEquipments,
      handleAddAccessibilityFeatures,
      onRemoveFaq,
      onRemoveTargetAudience,
      onRemoveLanguage,
      onRemoveProvidedMaterials,
      onRemoveRequiredEquipments,
      onRemoveAccessibilityFeatures,
      onToggleRefundPolicy,
    ]
  );

  return AdditionalFeaturesTab;
}