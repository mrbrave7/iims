import React, { useCallback, useMemo } from "react";
import {
    PiClock,
    PiEnvelope,
    PiLink,
    PiPhone,
    PiPlus,
    PiQuestion,
    PiTextAa,
    PiTrash,
    PiUsers,
    PiWarning,
} from "react-icons/pi";

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

interface AdditionalFeaturesTabProps {
    additionalFeatures: I_Offline_Course_Additional_Features;
    additionalFeaturesErrors: AdditionalFeaturesErrors;
    contactDetailsError: ContactDetailsError;
    refundPolicyError: RefundPolicyError;
    faqErrors: FAQErrors;
    singleTargetAudience: string;
    language: string;
    faqs: FAQ;
    onContactDetailsChange: (field: keyof ContactDetails, value: string) => void;
    onRefundPolicyChange: (field: keyof RefundPolicy, value: any) => void;
    onFaqChange: (field: keyof FAQ, value: string) => void;
    onSingleTargetAudienceChange: (value: string) => void;
    onLanguageChange: (value: string) => void;
    onCertificateTemplateUrlChange: (value: string) => void;
    onAddFaq: (faq: FAQ) => void;
    onAddTargetAudience: (audience: string) => void;
    onAddLanguage: (language: string) => void;
    onRemoveFaq: (index: number) => void;
    onRemoveTargetAudience: (index: number) => void;
    onRemoveLanguage: (index: number) => void;
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
    faqs,
    onContactDetailsChange,
    onRefundPolicyChange,
    onFaqChange,
    onSingleTargetAudienceChange,
    onLanguageChange,
    onCertificateTemplateUrlChange,
    onAddFaq,
    onAddTargetAudience,
    onAddLanguage,
    onRemoveFaq,
    onRemoveTargetAudience,
    onRemoveLanguage,
    onToggleRefundPolicy,
}: AdditionalFeaturesTabProps) {
    // Handlers for adding items with validation
    const handleAddFaq = useCallback(() => {
        const trimmedFaq = {
            question: faqs.question.trim(),
            answer: faqs.answer.trim(),
        };
        if (trimmedFaq.question && trimmedFaq.answer) {
            onAddFaq(trimmedFaq);
        }
    }, [faqs, onAddFaq]);

    const handleAddTargetAudience = useCallback(() => {
        const trimmed = singleTargetAudience.trim();
        if (trimmed) {
            onAddTargetAudience(trimmed);
            onSingleTargetAudienceChange(""); // Clear input after adding
        }
    }, [singleTargetAudience, onAddTargetAudience, onSingleTargetAudienceChange]);

    const handleAddLanguage = useCallback(() => {
        const trimmed = language.trim();
        if (trimmed) {
            onAddLanguage(trimmed);
            onLanguageChange(""); // Clear input after adding
        }
    }, [language, onAddLanguage, onLanguageChange]);

    const AdditionalFeaturesTabContent = useMemo(
        () => (
            <div className="w-[64rem] space-y-6">
                <h1 className="text-4xl font-bold text-orange-600">
                    Additional Features
                </h1>

                {/* Target Audience */}
                <div className="space-y-2 w-full">
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
                                maxLength={200}
                                aria-invalid={!!additionalFeaturesErrors.targetedAudience}
                                aria-describedby="targeted-audience-error"
                            />
                        </div>
                        <button
                            type="button"
                            onClick={handleAddTargetAudience}
                            className="flex rounded items-center gap-2 font-bold px-4 text-stone-100 dark:text-stone-900 bg-orange-600 text-stone-100 hover:bg-orange-700 transition-colors"
                            disabled={!singleTargetAudience.trim()}
                        >
                            <PiPlus />
                        </button>
                    </div>
                    {additionalFeaturesErrors.targetedAudience && (
                        <p
                            id="targeted-audience-error"
                            className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
                            aria-live="polite"
                        >
                            <PiWarning size={16} /> {additionalFeaturesErrors.targetedAudience}
                        </p>
                    )}
                    <div className="mt-4 space-y-2">
                        <span className="text-orange-600 font-bold">Your Audiences:</span>
                        {additionalFeatures.targetAudience.length > 0 ? (
                            <ul className="space-y-2">
                                {additionalFeatures.targetAudience.map((audience, index) => (
                                    <li
                                        key={index}
                                        className="flex gap-2 px-3 py-1 text-orange-600 rounded font-bold bg-stone-100/50 dark:bg-stone-800/50 w-fit"
                                    >
                                        <span>{audience}</span>
                                        <button
                                            type="button"
                                            onClick={() => onRemoveTargetAudience(index)}
                                            className="text-orange-600 hover:text-orange-800 cursor-pointer transition-colors"
                                            aria-label={`Remove ${audience}`}
                                        >
                                            <PiTrash />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-stone-500">No audiences added.</p>
                        )}
                    </div>
                </div>

                {/* Available Languages */}
                <div className="space-y-2 w-full">
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
                            className="flex rounded items-center gap-2 px-4 font-bold py-2 bg-orange-600 text-stone-100 hover:bg-orange-700 transition-colors"
                            disabled={!language.trim()}
                        >
                            <PiPlus /> Add
                        </button>
                    </div>
                    {additionalFeaturesErrors.availableLanguages && (
                        <p
                            id="course-language-error"
                            className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
                            aria-live="polite"
                        >
                            <PiWarning size={16} /> {additionalFeaturesErrors.availableLanguages}
                        </p>
                    )}
                    <div className="mt-4 space-y-2 ">
                        <span className="text-orange-600 font-bold">Available Languages:</span>
                        {additionalFeatures.availableLanguages.length > 0 ? (
                            <ul className="space-y-2 flex items-center justify-between gap-4">
                                {additionalFeatures.availableLanguages.map((lang, index) => (
                                    <li
                                        key={index}
                                        className="w-full text-orange-600 bg-stone-100/50 rounded flex items-center justify-between p-2 shadow-sm shadow-stone-500"
                                    >
                                        <span>{lang}</span>
                                        <button
                                            type="button"
                                            onClick={() => onRemoveLanguage(index)}
                                            className="text-red-600 hover:text-red-800 transition-colors"
                                            aria-label={`Remove ${lang}`}
                                        >
                                            <PiTrash />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-stone-500">No languages added.</p>
                        )}
                    </div>
                </div>

                {/* Certificate Template URL */}
                <div className="space-y-2">
                    <label htmlFor="certificateTemplateUrl" className="text-orange-600 font-bold">
                        Certificate Template URL
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <PiLink className="h-5 w-5 text-stone-400" />
                        </div>
                        <input
                            id="certificateTemplateUrl"
                            name="certificateTemplateUrl"
                            type="url"
                            value={additionalFeatures.certificateTemplateUrl}
                            onChange={(e) => onCertificateTemplateUrlChange(e.target.value)}
                            className={`pl-10 outline-none w-full rounded-lg border ${
                                additionalFeaturesErrors.certificateTemplateUrl
                                    ? "border-red-500"
                                    : additionalFeatures.certificateTemplateUrl
                                    ? "border-orange-500"
                                    : "border-stone-300 dark:border-stone-700"
                            } bg-stone-100 dark:bg-stone-800 py-2 px-3 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                            placeholder="e.g., https://example.com/certificate-template.pdf"
                            maxLength={500}
                            aria-invalid={!!additionalFeaturesErrors.certificateTemplateUrl}
                            aria-describedby="certificate-template-error"
                        />
                    </div>
                    {additionalFeaturesErrors.certificateTemplateUrl && (
                        <p
                            id="certificate-template-error"
                            className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
                            aria-live="polite"
                        >
                            <PiWarning size={16} /> {additionalFeaturesErrors.certificateTemplateUrl}
                        </p>
                    )}
                    <p className="text-xs text-stone-500">
                        {additionalFeatures.certificateTemplateUrl.length}/500 Characters
                    </p>
                </div>

                {/* Contact Details */}
                <div className="space-y-2">
                    <span className="text-2xl font-bold text-orange-600">Contact Details</span>
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
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
                                    maxLength={100}
                                    aria-invalid={!!contactDetailsError.email}
                                    aria-describedby="email-error"
                                    required
                                />
                            </div>
                            {contactDetailsError.email && (
                                <p
                                    id="email-error"
                                    className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
                                    aria-live="polite"
                                >
                                    <PiWarning size={16} /> {contactDetailsError.email}
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
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
                                    type="tel"
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
                                    required
                                />
                            </div>
                            {contactDetailsError.phone && (
                                <p
                                    id="phone-error"
                                    className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
                                    aria-live="polite"
                                >
                                    <PiWarning size={16} /> {contactDetailsError.phone}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* FAQs */}
                <div className="space-y-4">
                    <span className="text-2xl font-bold text-orange-600">Frequently Asked Questions</span>
                    <div className="grid grid-cols-9 items-center gap-6">
                        <div className="space-y-2 col-span-4">
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
                                    maxLength={200}
                                    aria-invalid={!!faqErrors.question}
                                    aria-describedby="faq-question-error"
                                />
                            </div>
                            {faqErrors.question && (
                                <p
                                    id="faq-question-error"
                                    className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
                                    aria-live="polite"
                                >
                                    <PiWarning size={16} /> {faqErrors.question}
                                </p>
                            )}
                            <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
                                {faqs.question.length}/100 characters
                            </p>
                        </div>
                        <div className="space-y-2 col-span-4">
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
                                    maxLength={300}
                                    aria-invalid={!!faqErrors.answer}
                                    aria-describedby="faq-answer-error"
                                />
                            </div>
                            {faqErrors.answer && (
                                <p
                                    id="faq-answer-error"
                                    className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
                                    aria-live="polite"
                                >
                                    <PiWarning size={16} /> {faqErrors.answer}
                                </p>
                            )}
                            <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
                                {faqs.answer.length}/200 characters
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={handleAddFaq}
                            className="flex rounded items-center gap-2 px-4 font-bold py-2 bg-orange-600 text-stone-100 hover:bg-orange-700 transition-colors"
                            disabled={!faqs.question.trim() || !faqs.answer.trim()}
                        >
                            <PiPlus /> Add
                        </button>
                    </div>
                    <div className="space-y-2">
                        <span className="text-orange-600 font-bold">Your Added FAQs:</span>
                        {additionalFeatures.faqs.length > 0 ? (
                            <ul className="space-y-2">
                                {additionalFeatures.faqs.map((faq, index) => (
                                    <li
                                        key={index}
                                        className="flex items-center justify-between text-orange-600"
                                    >
                                        <details className="w-full">
                                            <summary className="cursor-pointer font-medium">{faq.question}</summary>
                                            <p className="mt-2 text-stone-700 dark:text-stone-300">{faq.answer}</p>
                                        </details>
                                        <button
                                            type="button"
                                            onClick={() => onRemoveFaq(index)}
                                            className="text-red-600 hover:text-red-800 transition-colors"
                                            aria-label={`Remove FAQ: ${faq.question}`}
                                        >
                                            <PiTrash />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-stone-500">No FAQs added.</p>
                        )}
                    </div>
                </div>

                {/* Refund Policy */}
                <div className="space-y-2">
                    <label className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={additionalFeatures.refundPolicy.isRefundable}
                            onChange={onToggleRefundPolicy}
                            className="h-5 w-5 accent-orange-600 rounded"
                        />
                        <span className="text-orange-600 font-bold">Is There a Refund Policy?</span>
                    </label>
                    {additionalFeatures.refundPolicy.isRefundable && (
                        <div className="space-y-4">
                            <div className="space-y-2">
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
                                        required
                                    />
                                </div>
                                {refundPolicyError.refundPeriodDays && (
                                    <p
                                        id="refund-period-day-error"
                                        className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
                                        aria-live="polite"
                                    >
                                        <PiWarning size={16} /> {refundPolicyError.refundPeriodDays}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
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
                                    required
                                />
                                <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
                                    {additionalFeatures.refundPolicy.conditions.length}/500 characters
                                </p>
                                {refundPolicyError.conditions && (
                                    <p
                                        id="refund-conditions-error"
                                        className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
                                        aria-live="polite"
                                    >
                                        <PiWarning size={16} /> {refundPolicyError.conditions}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
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
            faqs,
            onContactDetailsChange,
            onRefundPolicyChange,
            onFaqChange,
            onSingleTargetAudienceChange,
            onLanguageChange,
            onCertificateTemplateUrlChange,
            handleAddFaq,
            handleAddTargetAudience,
            handleAddLanguage,
            onRemoveFaq,
            onRemoveTargetAudience,
            onRemoveLanguage,
            onToggleRefundPolicy,
        ]
    );

    return AdditionalFeaturesTabContent;
}