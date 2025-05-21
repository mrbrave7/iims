import React, { useCallback } from 'react';
import {
  PiCalendar,
  PiCoins,
  PiCurrencyCircleDollar,
  PiMegaphone,
  PiNote,
  PiPercent,
  PiPlus,
  PiSeat,
  PiTrash,
  PiWarning,
} from 'react-icons/pi';
import sanitizeHtml from 'sanitize-html';

// Interfaces
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


interface PricingAndOfferProps {
  pricingAndOffers: PricingAndOffers;
  pricingAndOffersErrors: PricingAndOfferError;
  newOfferDetail: OfferDetails;
  offerError: OfferError;
  worldCurrencies: string[];
  onPricingAndOfferChange: (name: keyof PricingAndOffers, value: any) => void;

  onNewOfferDetailChange: (name: keyof OfferDetails, value: any) => void;
  onAddOfferDetail: (offer: OfferDetails) => void;
  onRemoveOfferDetail: (index: number) => void;
  onOfferValidityChange: (value: Date) => void;
}

const PricingAndOfferTab: React.FC<PricingAndOfferProps> = ({
  pricingAndOffers,
  pricingAndOffersErrors,
  newOfferDetail,
  offerError,
  worldCurrencies,
  onPricingAndOfferChange,
  onNewOfferDetailChange,
  onAddOfferDetail,
  onRemoveOfferDetail,
  onOfferValidityChange,
}) => {
  // Handle pricing and offer changes
  const handlePricingAndOffer = useCallback(
    (name: keyof PricingAndOffers, value: any) => {
      let parsedValue: any;
      if (name === 'basePrice' || name === 'courseValidityInMonths') {
        parsedValue = Math.max(1, parseInt(value) || 1);
      } else if (name === 'termsAndConditions') {
        parsedValue = sanitizeHtml(value, { allowedTags: [] });
      } else {
        parsedValue = value;
      }
      onPricingAndOfferChange(name, parsedValue);
    },
    [onPricingAndOfferChange]
  );


  // Handle offer details changes
  const handleAddOffer = useCallback(
    (name: keyof OfferDetails, value: any) => {
      let parsedValue: any;
      if (name === 'discountPercentage' || name === 'offerSeatsAvailable') {
        parsedValue = Math.max(1, parseInt(value) || 1);
      } else {
        parsedValue = sanitizeHtml(value, { allowedTags: [] });
      }
      onNewOfferDetailChange(name, parsedValue);
    },
    [onNewOfferDetailChange]
  );

  // Handle adding offer
  const handleAddOfferDetail = useCallback(() => {
    if (
      newOfferDetail.offerCode.trim() &&
      newOfferDetail.offerDescription.trim() &&
      newOfferDetail.offerSlogan.trim() &&
      newOfferDetail.discountPercentage &&
      newOfferDetail.offerSeatsAvailable &&
      newOfferDetail.offerValidity
    ) {
      onAddOfferDetail(newOfferDetail);
      onNewOfferDetailChange('offerCode', '');
      onNewOfferDetailChange('offerDescription', '');
      onNewOfferDetailChange('offerSlogan', '');
      onNewOfferDetailChange('discountPercentage', 1);
      onNewOfferDetailChange('offerSeatsAvailable', 1);
      onOfferValidityChange(new Date());
    }
  }, [newOfferDetail, onAddOfferDetail, onNewOfferDetailChange, onOfferValidityChange]);

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

  // Get today's date for min attribute
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto">
      {/* Pricing Section */}
      <div className="space-y-6">
        <h1 className="text-4xl font-bold text-orange-600">Course Pricing And Offers</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Base Price */}
          <div className="space-y-1">
            <label htmlFor="basePrice" className="text-orange-600 font-bold">
              Base Price
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <PiCoins className="h-5 w-5 text-stone-400" />
              </div>
              <input
                id="basePrice"
                name="basePrice"
                type="number"
                required
                min="1"
                value={pricingAndOffers.basePrice}
                onChange={(e) => handlePricingAndOffer('basePrice', e.target.value)}
                className={`pl-10 outline-none w-full rounded-lg border ${
                  pricingAndOffersErrors.basePrice
                    ? 'border-red-500'
                    : pricingAndOffers.basePrice
                    ? 'border-orange-500'
                    : 'border-stone-300 dark:border-stone-700'
                } bg-stone-100 dark:bg-stone-800 py-2 px-3 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                placeholder="e.g., 5000"
                aria-invalid={!!pricingAndOffersErrors.basePrice}
                aria-describedby="basePrice-error"
                aria-required="true"
              />
            </div>
            <div aria-live="polite">
              {pricingAndOffersErrors.basePrice && (
                <p
                  id="basePrice-error"
                  className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
                >
                  <PiWarning size={16} /> {pricingAndOffersErrors.basePrice}
                </p>
              )}
            </div>
          </div>

          {/* Currency */}
          <div className="space-y-1">
            <label htmlFor="currency" className="text-orange-600 font-bold">
              Currency
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <PiCurrencyCircleDollar className="h-5 w-5 text-stone-400" />
              </div>
              <select
                id="currency"
                name="currency"
                required
                value={pricingAndOffers.currency}
                onChange={(e) => handlePricingAndOffer('currency', e.target.value)}
                className={`pl-10 outline-none w-full rounded-lg border ${
                  pricingAndOffersErrors.currency
                    ? 'border-red-500'
                    : pricingAndOffers.currency
                    ? 'border-orange-500'
                    : 'border-stone-300 dark:border-stone-700'
                } bg-stone-100 dark:bg-stone-800 py-2 px-3 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                aria-invalid={!!pricingAndOffersErrors.currency}
                aria-describedby="currency-error"
                aria-required="true"
              >
                <option value="" disabled>
                  Select Currency
                </option>
                {worldCurrencies.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div aria-live="polite">
              {pricingAndOffersErrors.currency && (
                <p
                  id="currency-error"
                  className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
                >
                  <PiWarning size={16} /> {pricingAndOffersErrors.currency}
                </p>
              )}
            </div>
          </div>

          {/* Course Validity */}
          <div className="space-y-1">
            <label htmlFor="courseValidityInMonths" className="text-orange-600 font-bold">
              Course Validity (Months)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <PiCalendar className="h-5 w-5 text-stone-400" />
              </div>
              <input
                id="courseValidityInMonths"
                name="courseValidityInMonths"
                type="number"
                required
                min="1"
                value={pricingAndOffers.courseValidityInMonths}
                onChange={(e) => handlePricingAndOffer('courseValidityInMonths', e.target.value)}
                className={`pl-10 outline-none w-full rounded-lg border ${
                  pricingAndOffersErrors.courseValidityInMonths
                    ? 'border-red-500'
                    : pricingAndOffers.courseValidityInMonths
                    ? 'border-orange-500'
                    : 'border-stone-300 dark:border-stone-700'
                } bg-stone-100 dark:bg-stone-800 py-2 px-3 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                placeholder="e.g., 12"
                aria-invalid={!!pricingAndOffersErrors.courseValidityInMonths}
                aria-describedby="courseValidityInMonths-error"
                aria-required="true"
              />
            </div>
            <div aria-live="polite">
              {pricingAndOffersErrors.courseValidityInMonths && (
                <p
                  id="courseValidityInMonths-error"
                  className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
                >
                  <PiWarning size={16} /> {pricingAndOffersErrors.courseValidityInMonths}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Offer Section */}
      <div className="space-y-6">
        <div className="flex my-6 gap-4">
          <input
            type="checkbox"
            onChange={(e) => {
              handlePricingAndOffer('isCourseOnOffer', e.target.checked);
              if (!e.target.checked) {
                onPricingAndOfferChange('offerDetails', []);
              }
            }}
            name="isCourseOnOffer"
            id="isCourseOnOffer"
            className="accent-orange-600 invalid:border-red-500 h-5 w-5"
            checked={pricingAndOffers.isCourseOnOffer}
            aria-checked={pricingAndOffers.isCourseOnOffer}
          />
          <label className="font-bold text-orange-600" htmlFor="isCourseOnOffer">
            Is Course On Offer
          </label>
        </div>
        {pricingAndOffers.isCourseOnOffer && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-orange-600">Offer Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Discount Percentage */}
              <div className="space-y-1">
                <label htmlFor="discountPercentage" className="text-orange-600 font-bold">
                  Discount Percentage
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
                    value={newOfferDetail.discountPercentage}
                    onChange={(e) => handleAddOffer('discountPercentage', e.target.value)}
                    className={`pl-10 outline-none w-full rounded-lg border ${
                      offerError.discountPercentage
                        ? 'border-red-500'
                        : newOfferDetail.discountPercentage
                        ? 'border-orange-500'
                        : 'border-stone-300 dark:border-stone-700'
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

              {/* Offer Code */}
              <div className="space-y-1">
                <label htmlFor="offerCode" className="text-orange-600 font-bold">
                  Offer Code
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <PiNote className="h-5 w-5 text-stone-400" />
                  </div>
                  <input
                    id="offerCode"
                    name="offerCode"
                    type="text"
                    required
                    value={newOfferDetail.offerCode}
                    onChange={(e) => handleAddOffer('offerCode', e.target.value)}
                    className={`pl-10 outline-none w-full rounded-lg border ${
                      offerError.offerCode
                        ? 'border-red-500'
                        : newOfferDetail.offerCode
                        ? 'border-orange-500'
                        : 'border-stone-300 dark:border-stone-700'
                    } bg-stone-100 dark:bg-stone-800 py-2 px-3 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                    placeholder="e.g., SAVE20"
                    maxLength={50}
                    aria-invalid={!!offerError.offerCode}
                    aria-describedby="offerCode-error offerCode-counter"
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
                  <p
                    id="offerCode-counter"
                    className="mt-1 text-xs text-stone-500 dark:text-stone-400"
                  >
                    {newOfferDetail.offerCode.length}/50 characters
                  </p>
                </div>
              </div>

              {/* Offer Seats Available */}
              <div className="space-y-1">
                <label htmlFor="offerSeatsAvailable" className="text-orange-600 font-bold">
                  Available Seats
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
                    value={newOfferDetail.offerSeatsAvailable}
                    onChange={(e) => handleAddOffer('offerSeatsAvailable', e.target.value)}
                    className={`pl-10 outline-none w-full rounded-lg border ${
                      offerError.offerSeatsAvailable
                        ? 'border-red-500'
                        : newOfferDetail.offerSeatsAvailable
                        ? 'border-orange-500'
                        : 'border-stone-300 dark:border-stone-700'
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

              {/* Offer Validity */}
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
                    min={today}
                    value={
                      newOfferDetail.offerValidity
                        ? newOfferDetail.offerValidity.toISOString().split('T')[0]
                        : ''
                    }
                    onChange={handleDateChange}
                    className={`pl-10 outline-none w-full rounded-lg border ${
                      offerError.offerValidity
                        ? 'border-red-500'
                        : newOfferDetail.offerValidity
                        ? 'border-orange-500'
                        : 'border-stone-300 dark:border-stone-700'
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

              {/* Offer Slogan */}
              <div className="space-y-1">
                <label htmlFor="offerSlogan" className="text-orange-600 font-bold">
                  Offer Slogan
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <PiMegaphone className="h-5 w-5 text-stone-400" />
                  </div>
                  <input
                    id="offerSlogan"
                    name="offerSlogan"
                    type="text"
                    required
                    value={newOfferDetail.offerSlogan}
                    onChange={(e) => handleAddOffer('offerSlogan', e.target.value)}
                    className={`pl-10 outline-none w-full rounded-lg border ${
                      offerError.offerSlogan
                        ? 'border-red-500'
                        : newOfferDetail.offerSlogan
                        ? 'border-orange-500'
                        : 'border-stone-300 dark:border-stone-700'
                    } bg-stone-100 dark:bg-stone-800 py-2 px-3 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                    placeholder="e.g., Save Big Today!"
                    maxLength={100}
                    aria-invalid={!!offerError.offerSlogan}
                    aria-describedby="offerSlogan-error offerSlogan-counter"
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
                  <p
                    id="offerSlogan-counter"
                    className="mt-1 text-xs text-stone-500 dark:text-stone-400"
                  >
                    {newOfferDetail.offerSlogan.length}/100 characters
                  </p>
                </div>
              </div>
            </div>

            {/* Offer Description */}
            <div className="space-y-1">
              <label htmlFor="offerDescription" className="text-orange-600 font-bold">
                Offer Description
              </label>
              <textarea
                id="offerDescription"
                name="offerDescription"
                required
                value={newOfferDetail.offerDescription}
                onChange={(e) => handleAddOffer('offerDescription', e.target.value)}
                className={`w-full rounded-lg border ${
                  offerError.offerDescription
                    ? 'border-red-500'
                    : newOfferDetail.offerDescription
                    ? 'border-orange-500'
                    : 'border-stone-300 dark:border-stone-700'
                } bg-stone-100 dark:bg-stone-800 py-2 px-3 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent min-h-[100px]`}
                placeholder="e.g., Limited time discount with special benefits"
                maxLength={1000}
                aria-invalid={!!offerError.offerDescription}
                aria-describedby="offerDescription-error offerDescription-counter"
                aria-required="true"
              />
              <div aria-live="polite">
                {offerError.offerDescription && (
                  <p
                    id="offerDescription-error"
                    className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
                  >
                    <PiWarning size={16} /> {offerError.offerDescription}
                  </p>
                )}
                <p
                  id="offerDescription-counter"
                  className="mt-1 text-xs text-stone-500 dark:text-stone-400"
                >
                  {newOfferDetail.offerDescription.length}/1000 characters
                </p>
              </div>
            </div>

            {/* Add Offer Button */}
            <button
              type="button"
              onClick={handleAddOfferDetail}
              disabled={
                !newOfferDetail.offerCode.trim() ||
                !newOfferDetail.offerDescription.trim() ||
                !newOfferDetail.offerSlogan.trim() ||
                !newOfferDetail.discountPercentage ||
                !newOfferDetail.offerSeatsAvailable ||
                !newOfferDetail.offerValidity
              }
              className="p-2 h-10 w-full rounded flex items-center justify-center bg-orange-600 text-stone-100 hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Add offer"
            >
              <PiPlus /> Add Offer
            </button>

            {/* Added Offers */}
            <div className="mt-4">
              {pricingAndOffers.offerDetails.length > 0 ? (
                <ul className="flex flex-wrap gap-4">
                  {pricingAndOffers.offerDetails.map((offer, index) => (
                    <li
                      key={index}
                      className="border-2 border-orange-600 p-2 rounded relative bg-stone-100 dark:bg-stone-800"
                    >
                      <div className="flex flex-col gap-1 text-orange-600 font-bold">
                        <span>Code: {offer.offerCode}</span>
                        <span>Slogan: {offer.offerSlogan}</span>
                        <span>Discount: {offer.discountPercentage}%</span>
                        <span>Seats: {offer.offerSeatsAvailable}</span>
                        <span>
                          Validity: {offer.offerValidity.toISOString().split('T')[0]}
                        </span>
                        <button
                          type="button"
                          onClick={() => onRemoveOfferDetail(index)}
                          className="text-red-600 absolute -top-3 -right-3 p-2 bg-stone-100 rounded-full border border-red-500 cursor-pointer hover:text-red-800 transition-colors"
                          aria-label={`Remove offer ${offer.offerCode}`}
                        >
                          <PiTrash />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-stone-500">No offers added.</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Terms and Conditions Section */}
      <div className="space-y-1">
        <label htmlFor="termsAndConditions" className="text-orange-600 font-bold">
          Terms and Conditions
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 pt-2 flex items-start pointer-events-none">
            <PiNote className="h-5 w-5 text-stone-400" />
          </div>
          <textarea
            id="termsAndConditions"
            name="termsAndConditions"
            required
            value={pricingAndOffers.termsAndConditions}
            onChange={(e) => handlePricingAndOffer('termsAndConditions', e.target.value)}
            className={`pl-10 outline-none w-full rounded-lg border ${
              pricingAndOffersErrors.termsAndConditions
                ? 'border-red-500'
                : pricingAndOffers.termsAndConditions
                ? 'border-orange-500'
                : 'border-stone-300 dark:border-stone-700'
            } bg-stone-100 dark:bg-stone-800 py-2 px-3 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent min-h-[100px]`}
            placeholder="e.g., Non-refundable after 7 days"
            maxLength={3000}
            aria-invalid={!!pricingAndOffersErrors.termsAndConditions}
            aria-describedby="termsAndConditions-error termsAndConditions-counter"
            aria-required="true"
          />
        </div>
        <div aria-live="polite">
          {pricingAndOffersErrors.termsAndConditions && (
            <p
              id="termsAndConditions-error"
              className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
            >
              <PiWarning size={16} /> {pricingAndOffersErrors.termsAndConditions}
            </p>
          )}
          <p
            id="termsAndConditions-counter"
            className="mt-1 text-xs text-stone-500 dark:text-stone-400"
          >
            {pricingAndOffers.termsAndConditions.length}/3000 characters
          </p>
        </div>
      </div>
    </div>
  );
};

export default PricingAndOfferTab;
