import React, { useCallback, useMemo, useState } from "react";
import {
  PiCalendar,
  PiCashRegister,
  PiClock,
  PiCode,
  PiCurrencyInr,
  PiListBullets,
  PiPercent,
  PiPlus,
  PiSeat,
  PiTrash,
  PiWarning,
} from "react-icons/pi";
import { CiBullhorn } from "react-icons/ci";
import { BsCash } from "react-icons/bs";

// Assuming worldCurrencies is an array of currency codes
const worldCurrencies = ["USD", "INR", "EUR", "GBP", "AUD"]; // Example, replace with actual data

// Interfaces
interface Paymant_Plans {
  planName: string;
  amount: number;
  duration: string;
}

interface Offer_Details {
  offerCode: string;
  offerDescription: string;
  offerSlogan: string;
  discountPercentage: number;
  offerSeatsAvailable: number;
  offerValidity: Date | string;
}

interface Course_Pricing_AndOffer {
  currency: string;
  basePrice: number;
  paymentPlans: Paymant_Plans[];
  isCourseOnOffer: boolean;
  offerDetail?: Offer_Details;
  termsAndCondition: string[];
}

interface Offer_Error {
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

interface Pricing_And_Offer_Error {
  basePrice: string;
  currency: string;
  isCourseOnOffer: string;
  offerDetail: string;
  paymentPlans: string;
  offerError: Offer_Error;
  termsAndCondition: string;
}

interface PricingAndOfferProps {
  pricingAndOffer: Course_Pricing_AndOffer;
  onPricingAndOfferChange: (name: keyof Course_Pricing_AndOffer, value: any) => void;
  error: Pricing_And_Offer_Error;
  courseType: string;
}

export function PricingAndOfferTab({
  pricingAndOffer,
  onPricingAndOfferChange,
  error,
  courseType,
}: PricingAndOfferProps) {
  const [singlePaymentPlan, setSinglePaymentPlan] = useState<Paymant_Plans>({
    planName: "",
    amount: 0,
    duration: "",
  });
  const [paymentPlanError, setPaymentPlanError] = useState<PaymentPlanError>({
    planName: "",
    amount: "",
    duration: "",
  });
  const [singleTermAndCondition, setSingleTermAndCondition] = useState<string>("");
  const [offerDetails, setOfferDetails] = useState<Offer_Details>(
    pricingAndOffer.offerDetail || {
      offerCode: "",
      offerDescription: "",
      offerSlogan: "",
      discountPercentage: 0,
      offerSeatsAvailable: 0,
      offerValidity: "",
    }
  );

  const handlePaymentPlan = useCallback((name: keyof Paymant_Plans, value: any) => {
    setSinglePaymentPlan((prev) => ({
      ...prev,
      [name]: value,
    }));
    setPaymentPlanError((prev) => ({
      ...prev,
      [name]: "",
    }));
  }, []);

  const handleAddOffer = useCallback((name: keyof Offer_Details, value: any) => {
    setOfferDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
    onPricingAndOfferChange("offerDetail", {
      ...offerDetails,
      [name]: value,
    });
  }, [offerDetails, onPricingAndOfferChange]);

  const handleAddPaymentPlan = useCallback(() => {
    const errors: PaymentPlanError = {
      planName: "",
      amount: "",
      duration: "",
    };
    let hasError = false;

    if (!singlePaymentPlan.planName || singlePaymentPlan.planName.trim() === "") {
      errors.planName = "Please enter a plan name";
      hasError = true;
    }
    if (!singlePaymentPlan.amount || singlePaymentPlan.amount <= 0) {
      errors.amount = "Please enter a valid amount greater than 0";
      hasError = true;
    }
    if (!singlePaymentPlan.duration || singlePaymentPlan.duration.trim() === "") {
      errors.duration = "Please enter a valid duration";
      hasError = true;
    }

    if (hasError) {
      setPaymentPlanError(errors);
      return;
    }

    const allPaymentPlans = [...pricingAndOffer.paymentPlans, singlePaymentPlan];
    onPricingAndOfferChange("paymentPlans", allPaymentPlans);
    setSinglePaymentPlan({
      planName: "",
      amount: 0,
      duration: "",
    });
    setPaymentPlanError({ planName: "", amount: "", duration: "" });
  }, [singlePaymentPlan, pricingAndOffer.paymentPlans, onPricingAndOfferChange]);

  const handleRemovePaymentPlan = useCallback(
    (index: number) => {
      const updatedPlans = pricingAndOffer.paymentPlans.filter((_, i) => i !== index);
      onPricingAndOfferChange("paymentPlans", updatedPlans);
    },
    [pricingAndOffer.paymentPlans, onPricingAndOfferChange]
  );

  const handleAddTermsAndCondition = useCallback(() => {
    if (!singleTermAndCondition || singleTermAndCondition.trim() === "") return;
    const allTermsAndCondition = [...pricingAndOffer.termsAndCondition, singleTermAndCondition];
    onPricingAndOfferChange("termsAndCondition", allTermsAndCondition);
    setSingleTermAndCondition("");
  }, [singleTermAndCondition, pricingAndOffer.termsAndCondition, onPricingAndOfferChange]);

  const handleRemoveTermsAndCondition = useCallback(
    (index: number) => {
      const updatedTerms = pricingAndOffer.termsAndCondition.filter((_, i) => i !== index);
      onPricingAndOfferChange("termsAndCondition", updatedTerms);
    },
    [pricingAndOffer.termsAndCondition, onPricingAndOfferChange]
  );

  const handleDateChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const dateValue = e.target.value;
      setOfferDetails((prev) => ({
        ...prev,
        offerValidity: dateValue,
      }));
      onPricingAndOfferChange("offerDetail", {
        ...offerDetails,
        offerValidity: dateValue,
      });
    },
    [offerDetails, onPricingAndOfferChange]
  );

  const PricingAndOffer = useMemo(
    () => (
      <div className="space-y-6 min-w-[64rem] p-6">
        <h1 className="text-3xl font-bold text-orange-600">
          Course Pricing and Offers
        </h1>
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="courseFeeStructure" className="text-orange-600 font-semibold">
              Course Fee Structure
            </label>
            <div className="relative">
              <PiCashRegister className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-400" />
              <input
                id="courseFeeStructure"
                name="basePrice"
                type="number"
                required
                min="1"
                value={pricingAndOffer.basePrice || ""}
                onChange={(e) => onPricingAndOfferChange("basePrice", Number(e.target.value))}
                className={`pl-10 w-full rounded-lg border ${
                  error.basePrice
                    ? "border-red-500"
                    : pricingAndOffer.basePrice
                    ? "border-orange-500"
                    : "border-stone-300 dark:border-stone-700"
                } bg-stone-100 dark:bg-stone-800 py-2 px-3 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                placeholder="e.g., 5000"
                aria-invalid={!!error.basePrice}
                aria-describedby="courseFeeStructure-error"
              />
            </div>
            {error.basePrice && (
              <p
                id="courseFeeStructure-error"
                className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
              >
                <PiWarning size={16} /> {error.basePrice}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <label htmlFor="currency" className="text-orange-600 font-semibold">
              Select Currency Type
            </label>
            <div className="relative">
              <PiCurrencyInr className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-400" />
              <select
                id="currency"
                name="currency"
                required
                value={pricingAndOffer.currency}
                onChange={(e) => onPricingAndOfferChange("currency", e.target.value)}
                className={`pl-10 w-full rounded-lg border ${
                  error.currency
                    ? "border-red-500"
                    : pricingAndOffer.currency
                    ? "border-orange-500"
                    : "border-stone-300 dark:border-stone-700"
                } bg-stone-100 dark:bg-stone-800 py-2 px-3 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                aria-invalid={!!error.currency}
                aria-describedby="pricingCurrency-error"
              >
                <option value="">Select Course Currency</option>
                {worldCurrencies.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            {error.currency && (
              <p
                id="pricingCurrency-error"
                className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
              >
                <PiWarning size={16} /> {error.currency}
              </p>
            )}
          </div>
        </div>

        {/* Payment Plans */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-orange-600">Payment Plans</h2>
          <div className="grid grid-cols-7 gap-4 items-end">
            <div className="space-y-2 col-span-2">
              <label htmlFor="planName" className="text-orange-600 font-semibold">
                Plan Name
              </label>
              <div className="relative">
                <PiListBullets className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-400" />
                <input
                  id="planName"
                  name="planName"
                  type="text"
                  required
                  value={singlePaymentPlan.planName}
                  onChange={(e) => handlePaymentPlan("planName", e.target.value)}
                  className={`pl-10 w-full rounded-lg border ${
                    paymentPlanError.planName
                      ? "border-red-500"
                      : singlePaymentPlan.planName
                      ? "border-orange-500"
                      : "border-stone-300 dark:border-stone-700"
                  } bg-stone-100 dark:bg-stone-800 py-2 px-3 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                  placeholder="e.g., One Time Payment"
                  maxLength={100}
                  aria-invalid={!!paymentPlanError.planName}
                  aria-describedby="planName-error"
                />
              </div>
              {paymentPlanError.planName && (
                <p
                  id="planName-error"
                  className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
                >
                  <PiWarning size={16} /> {paymentPlanError.planName}
                </p>
              )}
            </div>
            <div className="space-y-2 col-span-2">
              <label htmlFor="amount" className="text-orange-600 font-semibold">
                Amount
              </label>
              <div className="relative">
                <BsCash className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-400" />
                <input
                  id="amount"
                  name="amount"
                  type="number"
                  required
                  min="1"
                  value={singlePaymentPlan.amount || ""}
                  onChange={(e) => handlePaymentPlan("amount", Number(e.target.value))}
                  className={`pl-10 w-full rounded-lg border ${
                    paymentPlanError.amount
                      ? "border-red-500"
                      : singlePaymentPlan.amount
                      ? "border-orange-500"
                      : "border-stone-300 dark:border-stone-700"
                  } bg-stone-100 dark:bg-stone-800 py-2 px-3 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                  placeholder="e.g., 5000"
                  aria-invalid={!!paymentPlanError.amount}
                  aria-describedby="amount-error"
                />
              </div>
              {paymentPlanError.amount && (
                <p
                  id="amount-error"
                  className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
                >
                  <PiWarning size={16} /> {paymentPlanError.amount}
                </p>
              )}
            </div>
            <div className="space-y-2 col-span-2">
              <label htmlFor="duration" className="text-orange-600 font-semibold">
                Duration
              </label>
              <div className="relative">
                <PiClock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-400" />
                <input
                  id="duration"
                  name="duration"
                  type="text"
                  required
                  value={singlePaymentPlan.duration}
                  onChange={(e) => handlePaymentPlan("duration", e.target.value)}
                  className={`pl-10 w-full rounded-lg border ${
                    paymentPlanError.duration
                      ? "border-red-500"
                      : singlePaymentPlan.duration
                      ? "border-orange-500"
                      : "border-stone-300 dark:border-stone-700"
                  } bg-stone-100 dark:bg-stone-800 py-2 px-3 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                  placeholder="e.g., 3 months"
                  maxLength={100}
                  aria-invalid={!!paymentPlanError.duration}
                  aria-describedby="duration-error"
                />
              </div>
              {paymentPlanError.duration && (
                <p
                  id="duration-error"
                  className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
                >
                  <PiWarning size={16} /> {paymentPlanError.duration}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={handleAddPaymentPlan}
              className="flex items-center justify-center gap-2 h-10 px-6 font-semibold rounded bg-orange-600 text-white hover:bg-orange-700 transition-colors"
            >
              <PiPlus /> Add Plan
            </button>
          </div>
          {error.paymentPlans && (
            <p
              id="paymentPlans-error"
              className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
            >
              <PiWarning size={16} /> {error.paymentPlans}
            </p>
          )}
          <h3 className="text-lg font-semibold text-orange-600 mt-4">Your Payment Plans:</h3>
          <div className="flex flex-wrap gap-4">
            {pricingAndOffer.paymentPlans.map((plan, index) => (
              <div
                key={index}
                className="relative border-2 rounded-lg p-3 shadow-md bg-stone-100 dark:bg-stone-800 border-orange-600 text-orange-600 w-64"
              >
                <div className="space-y-1">
                  <p className="flex gap-2 items-center">
                    <span className="font-medium">Name:</span> {plan.planName}
                  </p>
                  <p className="flex gap-2 items-center">
                    <span className="font-medium">Amount:</span> {plan.amount}
                  </p>
                  <p className="flex gap-2 items-center">
                    <span className="font-medium">Duration:</span> {plan.duration}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemovePaymentPlan(index)}
                  className="absolute -top-3 -right-3 rounded-full bg-stone-100 dark:bg-stone-800 p-2 border border-orange-600 text-orange-600 hover:text-red-600 hover:border-red-600 transition-colors"
                  aria-label={`Remove ${plan.planName} plan`}
                >
                  <PiTrash size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Terms and Conditions */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-orange-600">Terms and Conditions</h2>
          <div className="flex gap-4 items-end">
            <div className="flex-1 space-y-2">
              <label htmlFor="termAndCondition" className="text-orange-600 font-semibold">
                Add Term or Condition
              </label>
              <div className="relative">
                <PiListBullets className="absolute left-3 top-3 h-5 w-5 text-stone-400" />
                <textarea
                  id="termAndCondition"
                  value={singleTermAndCondition}
                  onChange={(e) => setSingleTermAndCondition(e.target.value)}
                  className="pl-10 w-full rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-100 dark:bg-stone-800 py-2 px-3 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent min-h-[80px]"
                  placeholder="e.g., Non-refundable after 7 days"
                  maxLength={500}
                />
              </div>
            </div>
            <button
              type="button"
              onClick={handleAddTermsAndCondition}
              className="flex items-center justify-center gap-2 h-10 px-6 font-semibold rounded bg-orange-600 text-white hover:bg-orange-700 transition-colors"
            >
              <PiPlus /> Add Term
            </button>
          </div>
          {error.termsAndCondition && (
            <p
              id="termsAndCondition-error"
              className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
            >
              <PiWarning size={16} /> {error.termsAndCondition}
            </p>
          )}
          <h3 className="text-lg font-semibold text-orange-600 mt-4">Your Terms and Conditions:</h3>
          <div className="flex flex-wrap gap-4">
            {pricingAndOffer.termsAndCondition.map((term, index) => (
              <div
                key={index}
                className="relative border-2 rounded-lg p-3 shadow-md bg-stone-100 dark:bg-stone-800 border-orange-600 text-orange-600 w-64"
              >
                <p>{term}</p>
                <button
                  type="button"
                  onClick={() => handleRemoveTermsAndCondition(index)}
                  className="absolute -top-3 -right-3 rounded-full bg-stone-100 dark:bg-stone-800 p-2 border border-orange-600 text-orange-600 hover:text-red-600 hover:border-red-600 transition-colors"
                  aria-label={`Remove term: ${term}`}
                >
                  <PiTrash size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Offer Toggle */}
        <div className="flex items-center gap-4">
          <input
            type="checkbox"
            id="isCourseOnOffer"
            name="isCourseOnOffer"
            checked={pricingAndOffer.isCourseOnOffer}
            onChange={(e) => onPricingAndOfferChange("isCourseOnOffer", e.target.checked)}
            className="h-5 w-5 accent-orange-600 focus:ring-orange-500"
            aria-label="Toggle course offer"
          />
          <label htmlFor="isCourseOnOffer" className="text-orange-600 font-semibold">
            Is Course On Offer
          </label>
        </div>

        {/* Offer Details */}
        {pricingAndOffer.isCourseOnOffer && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-orange-600">Offer Details</h2>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="discountPercentage" className="text-orange-600 font-semibold">
                  Discount Percentage
                </label>
                <div className="relative">
                  <PiPercent className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-400" />
                  <input
                    id="discountPercentage"
                    name="discountPercentage"
                    type="number"
                    required
                    min="1"
                    max="100"
                    value={offerDetails.discountPercentage || ""}
                    onChange={(e) => handleAddOffer("discountPercentage", Number(e.target.value))}
                    className={`pl-10 w-full rounded-lg border ${
                      error.offerError.discountPercentage
                        ? "border-red-500"
                        : offerDetails.discountPercentage
                        ? "border-orange-500"
                        : "border-stone-300 dark:border-stone-700"
                    } bg-stone-100 dark:bg-stone-800 py-2 px-3 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                    placeholder="e.g., 20"
                    aria-invalid={!!error.offerError.discountPercentage}
                    aria-describedby="discountPercentage-error"
                  />
                </div>
                {error.offerError.discountPercentage && (
                  <p
                    id="discountPercentage-error"
                    className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
                  >
                    <PiWarning size={16} /> {error.offerError.discountPercentage}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <label htmlFor="offerCode" className="text-orange-600 font-semibold">
                  Offer Code
                </label>
                <div className="relative">
                  <PiCode className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-400" />
                  <input
                    id="offerCode"
                    name="offerCode"
                    type="text"
                    required
                    value={offerDetails.offerCode}
                    onChange={(e) => handleAddOffer("offerCode", e.target.value.toUpperCase())}
                    className={`pl-10 w-full rounded-lg border ${
                      error.offerError.offerCode
                        ? "border-red-500"
                        : offerDetails.offerCode
                        ? "border-orange-500"
                        : "border-stone-300 dark:border-stone-700"
                    } bg-stone-100 dark:bg-stone-800 py-2 px-3 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                    placeholder="e.g., SAVE20"
                    maxLength={20}
                    aria-invalid={!!error.offerError.offerCode}
                    aria-describedby="offerCode-error"
                  />
                </div>
                {error.offerError.offerCode && (
                  <p
                    id="offerCode-error"
                    className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
                  >
                    <PiWarning size={16} /> {error.offerError.offerCode}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <label htmlFor="offerSeatsAvailable" className="text-orange-600 font-semibold">
                  Offer Available Seats
                </label>
                <div className="relative">
                  <PiSeat className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-400" />
                  <input
                    id="offerSeatsAvailable"
                    name="offerSeatsAvailable"
                    type="number"
                    required
                    min="1"
                    value={offerDetails.offerSeatsAvailable || ""}
                    onChange={(e) => handleAddOffer("offerSeatsAvailable", Number(e.target.value))}
                    className={`pl-10 w-full rounded-lg border ${
                      error.offerError.offerSeatsAvailable
                        ? "border-red-500"
                        : offerDetails.offerSeatsAvailable
                        ? "border-orange-500"
                        : "border-stone-300 dark:border-stone-700"
                    } bg-stone-100 dark:bg-stone-800 py-2 px-3 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                    placeholder="e.g., 50"
                    aria-invalid={!!error.offerError.offerSeatsAvailable}
                    aria-describedby="offerSeatsAvailable-error"
                  />
                </div>
                {error.offerError.offerSeatsAvailable && (
                  <p
                    id="offerSeatsAvailable-error"
                    className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
                  >
                    <PiWarning size={16} /> {error.offerError.offerSeatsAvailable}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <label htmlFor="offerValidity" className="text-orange-600 font-semibold">
                  Offer Validity
                </label>
                <div className="relative">
                  <PiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-400" />
                  <input
                    id="offerValidity"
                    name="offerValidity"
                    type="date"
                    required
                    value={
                      offerDetails.offerValidity instanceof Date
                        ? offerDetails.offerValidity.toISOString().split("T")[0]
                        : offerDetails.offerValidity
                    }
                    onChange={handleDateChange}
                    className={`pl-10 w-full rounded-lg border ${
                      error.offerError.offerValidity
                        ? "border-red-500"
                        : offerDetails.offerValidity
                        ? "border-orange-500"
                        : "border-stone-300 dark:border-stone-700"
                    } bg-stone-100 dark:bg-stone-800 py-2 px-3 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                    aria-invalid={!!error.offerError.offerValidity}
                    aria-describedby="offerValidity-error"
                  />
                </div>
                {error.offerError.offerValidity && (
                  <p
                    id="offerValidity-error"
                    className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
                  >
                    <PiWarning size={16} /> {error.offerError.offerValidity}
                  </p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="offerSlogan" className="text-orange-600 font-semibold">
                Offer Slogan
              </label>
              <div className="relative">
                <CiBullhorn className="absolute left-3 top-3 h-5 w-5 text-stone-400" />
                <input
                  id="offerSlogan"
                  name="offerSlogan"
                  type="text"
                  required
                  value={offerDetails.offerSlogan}
                  onChange={(e) => handleAddOffer("offerSlogan", e.target.value)}
                  className={`pl-10 w-full rounded-lg border ${
                    error.offerError.offerSlogan
                      ? "border-red-500"
                      : offerDetails.offerSlogan
                      ? "border-orange-500"
                      : "border-stone-300 dark:border-stone-700"
                  } bg-stone-100 dark:bg-stone-800 py-2 px-3 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                  placeholder="e.g., Save Big Today!"
                  maxLength={100}
                  aria-invalid={!!error.offerError.offerSlogan}
                  aria-describedby="offerSlogan-error"
                />
              </div>
              {error.offerError.offerSlogan && (
                <p
                  id="offerSlogan-error"
                  className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
                >
                  <PiWarning size={16} /> {error.offerError.offerSlogan}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <label htmlFor="offerDescription" className="text-orange-600 font-semibold">
                Offer Description
              </label>
              <textarea
                id="offerDescription"
                name="offerDescription"
                value={offerDetails.offerDescription}
                onChange={(e) => handleAddOffer("offerDescription", e.target.value)}
                className={`w-full rounded-lg border ${
                  error.offerError.offerDescription
                    ? "border-red-500"
                    : offerDetails.offerDescription
                    ? "border-orange-500"
                    : "border-stone-300 dark:border-stone-700"
                } bg-stone-100 dark:bg-stone-800 py-2 px-3 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent min-h-[100px]`}
                placeholder="Describe the offer (e.g., limited time discount, special benefits)"
                maxLength={1000}
                aria-invalid={!!error.offerError.offerDescription}
                aria-describedby="offerDescription-error"
              />
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {offerDetails.offerDescription.length}/1000 characters
              </p>
              {error.offerError.offerDescription && (
                <p
                  id="offerDescription-error"
                  className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
                >
                  <PiWarning size={16} /> {error.offerError.offerDescription}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    ),
    [
      pricingAndOffer,
      error,
      singlePaymentPlan,
      paymentPlanError,
      offerDetails,
      singleTermAndCondition,
      handleAddPaymentPlan,
      handleRemovePaymentPlan,
      handleAddTermsAndCondition,
      handleRemoveTermsAndCondition,
      handleDateChange,
    ]
  );

  return PricingAndOffer;
}