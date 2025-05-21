import React, { useCallback, useMemo } from "react";
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
  offerValidity: Date;
}

interface OfflineCoursePricingAndOffer {
  currency: string;
  courseFeeStructure: number;
  paymentPlans: Paymant_Plans[];
  isCourseOnOffer: boolean;
  offerDetail?: Offer_Details;
}

interface Pricing_And_Offer_Error {
  courseFeeStructure: string;
  currency: string;
  isCourseOnOffer: string;
  offerDetail: string;
  paymentPlans: string;
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

interface PricingAndOfferProps {
  pricingAndOffers: OfflineCoursePricingAndOffer;
  pricingAndOffersErrors: Pricing_And_Offer_Error;
  newPaymentPlan: Paymant_Plans;
  paymentPlanError: PaymentPlanError;
  offerDetails: Offer_Details;
  offerError: Offer_Error;
  worldCurrencies: string[];
  onPricingAndOfferChange: (name: keyof OfflineCoursePricingAndOffer, value: any) => void;
  onPaymentPlanChange: (name: keyof Paymant_Plans, value: any) => void;
  onAddPaymentPlan: (plan: Paymant_Plans) => void;
  onRemovePaymentPlan: (planName: string) => void;
  onOfferDetailsChange: (name: keyof Offer_Details, value: any) => void;
  onOfferValidityChange: (value: Date) => void;
}

export function PricingAndOfferTab({
  pricingAndOffers,
  pricingAndOffersErrors,
  newPaymentPlan,
  paymentPlanError,
  offerDetails,
  offerError,
  worldCurrencies,
  onPricingAndOfferChange,
  onPaymentPlanChange,
  onAddPaymentPlan,
  onRemovePaymentPlan,
  onOfferDetailsChange,
  onOfferValidityChange,
}: PricingAndOfferProps) {
  // Handle pricing and offer changes
  const handlePricingAndOffer = useCallback(
    (name: keyof OfflineCoursePricingAndOffer, value: any) => {
      const parsedValue =
        name === "courseFeeStructure" ? parseInt(value) || 0 : value;
      onPricingAndOfferChange(name, parsedValue);
    },
    [onPricingAndOfferChange]
  );

  // Handle payment plan input changes
  const handlePaymentPlan = useCallback(
    (name: keyof Paymant_Plans, value: any) => {
      const parsedValue = name === "amount" ? parseInt(value) || 0 : value;
      onPaymentPlanChange(name, parsedValue);
    },
    [onPaymentPlanChange]
  );

  // Handle adding payment plan
  const handleAddPaymentPlan = useCallback(() => {
    onAddPaymentPlan(newPaymentPlan);
  }, [newPaymentPlan, onAddPaymentPlan]);

  // Handle offer details changes
  const handleAddOffer = useCallback(
    (name: keyof Offer_Details, value: any) => {
      const parsedValue =
        name === "discountPercentage" || name === "offerSeatsAvailable"
          ? parseInt(value) || 0
          : value;
      onOfferDetailsChange(name, parsedValue);
    },
    [onOfferDetailsChange]
  );

  // Handle date change for offer validity
  const handleDateChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const date = new Date(e.target.value);
      if (!isNaN(date.getTime())) {
        onOfferValidityChange(date);
      }
    },
    [onOfferValidityChange]
  );

  const PricingAndOffer = useMemo(
    () => (
      <div className="space-y-6 min-w-[64rem]">
        <h1 className="text-4xl font-bold text-orange-600 text-shadow-xl">
          Course Pricing And Offers
        </h1>
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-1">
            <label htmlFor="courseFeeStructure" className="text-orange-600 font-bold">
              Course Fee Structure
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <PiCashRegister className="h-5 w-5 text-stone-400" />
              </div>
              <input
                id="courseFeeStructure"
                name="courseFeeStructure"
                type="number"
                required
                min="1"
                value={pricingAndOffers.courseFeeStructure || ""}
                onChange={(e) => handlePricingAndOffer("courseFeeStructure", e.target.value)}
                className={`pl-10 outline-none w-full rounded-lg border ${pricingAndOffersErrors.courseFeeStructure
                  ? "border-red-500"
                  : pricingAndOffers.courseFeeStructure
                    ? "border-orange-500"
                    : "border-stone-300 dark:border-stone-700"
                  } bg-stone-100 dark:bg-stone-800 py-2 px-3 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                placeholder="e.g., 5000"
                aria-invalid={!!pricingAndOffersErrors.courseFeeStructure}
                aria-describedby="courseFeeStructure-error"
                aria-required="true"
              />
            </div>
            <div aria-live="polite">
              {pricingAndOffersErrors.courseFeeStructure && (
                <p
                  id="courseFeeStructure-error"
                  className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
                >
                  <PiWarning size={16} /> {pricingAndOffersErrors.courseFeeStructure}
                </p>
              )}
            </div>
          </div>
          <div className="space-y-1">
            <label htmlFor="currency" className="text-orange-600 font-bold">
              Select Currency Type
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <PiCurrencyInr className="h-5 w-5 text-stone-400" />
              </div>
              <select
                id="currency"
                name="currency"
                required
                value={pricingAndOffers.currency}
                onChange={(e) => handlePricingAndOffer("currency", e.target.value)}
                className={`pl-10 outline-none w-full rounded-lg border ${pricingAndOffersErrors.currency
                  ? "border-red-500"
                  : pricingAndOffers.currency
                    ? "border-orange-500"
                    : "border-stone-300 dark:border-stone-700"
                  } bg-stone-100 dark:bg-stone-800 py-2 px-3 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                aria-invalid={!!pricingAndOffersErrors.currency}
                aria-describedby="pricingCurrency-error"
                aria-required="true"
              >
                <option value="">Select Course Currency</option>
                {worldCurrencies.map((option, index) => (
                  <option key={index} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div aria-live="polite">
              {pricingAndOffersErrors.currency && (
                <p
                  id="pricingCurrency-error"
                  className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
                >
                  <PiWarning size={16} /> {pricingAndOffersErrors.currency}
                </p>
              )}
            </div>
          </div>
        </div>
        <div className="space-y-1 w-full">
          <h2 className="text-2xl mb-2 font-bold text-orange-600 text-shadow-xl">
            Payment Plan
          </h2>
          <div className="flex flex-col space-y-2">
            <div
              className="grid grid-cols-7 items-end gap-4"
              aria-invalid={!!pricingAndOffersErrors.paymentPlans}
              aria-describedby="paymentPlans-error"
              aria-required="true"
            >
              <div className="space-y-1 col-span-2">
                <label htmlFor="planName" className="text-orange-600 font-bold">
                  Plan Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <PiListBullets className="h-5 w-5 text-stone-400" />
                  </div>
                  <input
                    id="planName"
                    name="planName"
                    type="text"
                    required
                    value={newPaymentPlan.planName}
                    onChange={(e) => handlePaymentPlan("planName", e.target.value)}
                    className={`pl-10 outline-none w-full rounded-lg border ${paymentPlanError.planName
                      ? "border-red-500"
                      : newPaymentPlan.planName
                        ? "border-orange-500"
                        : "border-stone-300 dark:border-stone-700"
                      } bg-stone-100 dark:bg-stone-800 py-2 px-3 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                    placeholder="e.g., One Time Payment"
                    maxLength={100}
                    aria-invalid={!!paymentPlanError.planName}
                    aria-describedby="planName-error"
                    aria-required="true"
                  />
                </div>
                <div aria-live="polite">
                  {paymentPlanError.planName && (
                    <p
                      id="planName-error"
                      className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
                    >
                      <PiWarning size={16} /> {paymentPlanError.planName}
                    </p>
                  )}
                </div>
              </div>
              <div className="space-y-1 col-span-2">
                <label htmlFor="amount" className="text-orange-600 font-bold">
                  Amount
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <BsCash className="h-5 w-5 text-stone-400" />
                  </div>
                  <input
                    id="amount"
                    name="amount"
                    type="number"
                    required
                    min="1"
                    value={newPaymentPlan.amount || ""}
                    onChange={(e) => handlePaymentPlan("amount", e.target.value)}
                    className={`pl-10 outline-none w-full rounded-lg border ${paymentPlanError.amount
                      ? "border-red-500"
                      : newPaymentPlan.amount
                        ? "border-orange-500"
                        : "border-stone-300 dark:border-stone-700"
                      } bg-stone-100 dark:bg-stone-800 py-2 px-3 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                    placeholder="e.g., 5000"
                    aria-invalid={!!paymentPlanError.amount}
                    aria-describedby="amount-error"
                    aria-required="true"
                  />
                </div>
                <div aria-live="polite">
                  {paymentPlanError.amount && (
                    <p
                      id="amount-error"
                      className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
                    >
                      <PiWarning size={16} /> {paymentPlanError.amount}
                    </p>
                  )}
                </div>
              </div>
              <div className="space-y-1 col-span-2">
                <label htmlFor="duration" className="text-orange-600 font-bold">
                  Duration
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <PiClock className="h-5 w-5 text-stone-400" />
                  </div>
                  <input
                    id="duration"
                    name="duration"
                    type="text"
                    required
                    value={newPaymentPlan.duration}
                    onChange={(e) => handlePaymentPlan("duration", e.target.value)}
                    className={`pl-10 outline-none w-full rounded-lg border ${paymentPlanError.duration
                      ? "border-red-500"
                      : newPaymentPlan.duration
                        ? "border-orange-500"
                        : "border-stone-300 dark:border-stone-700"
                      } bg-stone-100 dark:bg-stone-800 py-2 px-3 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                    placeholder="e.g., 3 months"
                    maxLength={100}
                    aria-invalid={!!paymentPlanError.duration}
                    aria-describedby="duration-error"
                    aria-required="true"
                  />
                </div>
                <div aria-live="polite">
                  {paymentPlanError.duration && (
                    <p
                      id="duration-error"
                      className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
                    >
                      <PiWarning size={16} /> {paymentPlanError.duration}
                    </p>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={handleAddPaymentPlan}
                className="p-2 h-10 px-6 font-bold rounded cursor-pointer text-stone-100 dark:text-stone-900 flex items-center justify-between bg-orange-600"
              >
                <PiPlus /> Add Plan
              </button>
            </div>
            <div aria-live="polite">
              {pricingAndOffersErrors.paymentPlans && (
                <p
                  id="paymentPlans-error"
                  className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
                >
                  <PiWarning size={16} /> {pricingAndOffersErrors.paymentPlans}
                </p>
              )}
            </div>
          </div>
            <h1 className="mb-2 text-xl font-bold text-orange-600 p-2">Your Payment Plans :</h1>
          <div className="flex gap-4">
            {pricingAndOffers.paymentPlans.map((plan, index) => (
              <div
                className="border-2 rounded p-3 relative shadow shadow-orange-600 text-orange-600 bg-stone-100/50 dark:bg-stone-800 w-fit border-orange-600 p-2 mb-2"
                key={index}
              >
                <span className="flex gap-2 items-center">
                  Name: <p>{plan.planName}</p>
                </span>
                <span className="flex gap-2 items-center">
                  Amount: <p>{plan.amount}</p>
                </span>
                <span className="flex gap-2 items-center">
                  Duration: <p>{plan.duration}</p>
                </span>
                <button
                  type="button"
                  onClick={() => onRemovePaymentPlan(plan.planName)}
                  className="text-orange-600 absolute -top-3 -right-3 rounded-full bg-stone-100 p-2 border border-orange-600 hover:text-red-800"
                >
                  <PiTrash />
                </button>
              </div>
            ))}
          </div>
          <div className="flex my-6 gap-4">
            <input
              type="checkbox"
              onChange={(e) => handlePricingAndOffer("isCourseOnOffer", e.target.checked)}
              name="isCourseOnOffer"
              id="isCourseOnOffer"
              className="accent-orange-600 h-5 w-5"
              checked={pricingAndOffers.isCourseOnOffer}
            />
            <label className="font-bold text-orange-600" htmlFor="isCourseOnOffer">
              Is Course On Offer
            </label>
          </div>
          {pricingAndOffers.isCourseOnOffer && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label htmlFor="discountPercentage" className="text-orange-600 font-bold">
                    Discount In Percentage
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <PiPercent className="h-5 w-5 text-stone-400" />
                    </div>
                    <input
                      id="discountPercentage"
                      name="discountPercentage"
                      type="number"
                      required
                      min="1"
                      max="100"
                      value={offerDetails.discountPercentage || ""}
                      onChange={(e) => handleAddOffer("discountPercentage", e.target.value)}
                      className={`pl-10 outline-none w-full rounded-lg border ${offerError.discountPercentage
                        ? "border-red-500"
                        : offerDetails.discountPercentage
                          ? "border-orange-500"
                          : "border-stone-300 dark:border-stone-700"
                        } bg-stone-100 dark:bg-stone-800 py-2 px-3 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                      placeholder="e.g., 20"
                      aria-invalid={!!offerError.discountPercentage}
                      aria-describedby="discountPercentage-error"
                      aria-required="true"
                    />
                  </div>
                  <div aria-live="polite">
                    {offerError.discountPercentage && (
                      <p
                        id="discountPercentage-error"
                        className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
                      >
                        <PiWarning size={16} /> {offerError.discountPercentage}
                      </p>
                    )}
                  </div>
                </div>
                <div className="space-y-1">
                  <label htmlFor="offerCode" className="text-orange-600 font-bold">
                    Offer Code
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <PiCode className="h-5 w-5 text-stone-400" />
                    </div>
                    <input
                      id="offerCode"
                      name="offerCode"
                      type="text"
                      required
                      value={offerDetails.offerCode}
                      onChange={(e) => handleAddOffer("offerCode", e.target.value)}
                      className={`pl-10 outline-none w-full rounded-lg border ${offerError.offerCode
                        ? "border-red-500"
                        : offerDetails.offerCode
                          ? "border-orange-500"
                          : "border-stone-300 dark:border-stone-700"
                        } bg-stone-100 dark:bg-stone-800 py-2 px-3 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                      placeholder="e.g., SAVE20"
                      maxLength={50}
                      aria-invalid={!!offerError.offerCode}
                      aria-describedby="offerCode-error"
                      aria-required="true"
                    />
                  </div>
                  <div aria-live="polite">
                    {offerError.offerCode && (
                      <p
                        id="offerCode-error"
                        className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
                      >
                        <PiWarning size={16} /> {offerError.offerCode}
                      </p>
                    )}
                  </div>
                </div>
                <div className="space-y-1">
                  <label htmlFor="offerSeatsAvailable" className="text-orange-600 font-bold">
                    Offer Available Seats
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <PiSeat className="h-5 w-5 text-stone-400" />
                    </div>
                    <input
                      id="offerSeatsAvailable"
                      name="offerSeatsAvailable"
                      type="number"
                      required
                      min="1"
                      value={offerDetails.offerSeatsAvailable || ""}
                      onChange={(e) => handleAddOffer("offerSeatsAvailable", e.target.value)}
                      className={`pl-10 outline-none w-full rounded-lg border ${offerError.offerSeatsAvailable
                        ? "border-red-500"
                        : offerDetails.offerSeatsAvailable
                          ? "border-orange-500"
                          : "border-stone-300 dark:border-stone-700"
                        } bg-stone-100 dark:bg-stone-800 py-2 px-3 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                      placeholder="e.g., 50"
                      aria-invalid={!!offerError.offerSeatsAvailable}
                      aria-describedby="offerSeatsAvailable-error"
                      aria-required="true"
                    />
                  </div>
                  <div aria-live="polite">
                    {offerError.offerSeatsAvailable && (
                      <p
                        id="offerSeatsAvailable-error"
                        className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
                      >
                        <PiWarning size={16} /> {offerError.offerSeatsAvailable}
                      </p>
                    )}
                  </div>
                </div>
                <div className="space-y-1">
                  <label htmlFor="offerValidity" className="text-orange-600 font-bold">
                    Offer Validity
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <PiCalendar className="h-5 w-5 text-stone-400" />
                    </div>
                    <input
                      id="offerValidity"
                      name="offerValidity"
                      type="date"
                      required
                      value={offerDetails.offerValidity}
                      onChange={handleDateChange}
                      className={`pl-10 outline-none w-full rounded-lg border ${offerError.offerValidity
                        ? "border-red-500"
                        : offerDetails.offerValidity
                          ? "border-orange-500"
                          : "border-stone-300 dark:border-stone-700"
                        } bg-stone-100 dark:bg-stone-800 py-2 px-3 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                      aria-invalid={!!offerError.offerValidity}
                      aria-describedby="offerValidity-error"
                      aria-required="true"
                    />
                  </div>
                  <div aria-live="polite">
                    {offerError.offerValidity && (
                      <p
                        id="offerValidity-error"
                        className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
                      >
                        <PiWarning size={16} /> {offerError.offerValidity}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <div className="space-y-1 mt-4">
                <label htmlFor="offerSlogan" className="text-orange-600 font-bold">
                  Offer Slogan
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <CiBullhorn className="h-5 w-5 text-stone-400" />
                  </div>
                  <input
                    id="offerSlogan"
                    name="offerSlogan"
                    type="text"
                    required
                    value={offerDetails.offerSlogan}
                    onChange={(e) => handleAddOffer("offerSlogan", e.target.value)}
                    className={`pl-10 outline-none w-full rounded-lg border ${offerError.offerSlogan
                      ? "border-red-500"
                      : offerDetails.offerSlogan
                        ? "border-orange-500"
                        : "border-stone-300 dark:border-stone-700"
                      } bg-stone-100 dark:bg-stone-800 py-2 px-3 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                    placeholder="e.g., Save Big Today!"
                    maxLength={100}
                    aria-invalid={!!offerError.offerSlogan}
                    aria-describedby="offerSlogan-error"
                    aria-required="true"
                  />
                </div>
                <div aria-live="polite">
                  {offerError.offerSlogan && (
                    <p
                      id="offerSlogan-error"
                      className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
                    >
                      <PiWarning size={16} /> {offerError.offerSlogan}
                    </p>
                  )}
                </div>
              </div>
              <div className="space-y-1 mt-4">
                <label htmlFor="offerDescription" className="text-orange-600 font-bold">
                  Course Offer Description
                </label>
                <textarea
                  id="offerDescription"
                  name="offerDescription"
                  value={offerDetails.offerDescription}
                  onChange={(e) => handleAddOffer("offerDescription", e.target.value)}
                  className={`w-full rounded-lg border ${offerError.offerDescription
                    ? "border-red-500"
                    : offerDetails.offerDescription
                      ? "border-orange-500"
                      : "border-stone-300 dark:border-stone-700"
                    } bg-stone-100 dark:bg-stone-800 py-2 px-3 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent min-h-[100px]`}
                  placeholder="Describe the offer (e.g., limited time discount, special benefits)"
                  maxLength={1000}
                  aria-invalid={!!offerError.offerDescription}
                  aria-describedby="offerDescription-error"
                  aria-required="true"
                />
                <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
                  {offerDetails.offerDescription.length}/1000 characters
                </p>
                <div aria-live="polite">
                  {offerError.offerDescription && (
                    <p
                      id="offerDescription-error"
                      className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
                    >
                      <PiWarning size={16} /> {offerError.offerDescription}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    ),
    [
      pricingAndOffers,
      pricingAndOffersErrors,
      newPaymentPlan,
      paymentPlanError,
      offerDetails,
      offerError,
      worldCurrencies,
      handlePricingAndOffer,
      handlePaymentPlan,
      handleAddPaymentPlan,
      onRemovePaymentPlan,
      handleAddOffer,
      handleDateChange,
    ]
  );

  return PricingAndOffer;
}