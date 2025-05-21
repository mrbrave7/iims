import React, { useCallback } from 'react';
import { PiPlus, PiTag, PiTextAa, PiTrash, PiVideo, PiWarning } from 'react-icons/pi';
import sanitizeHtml from 'sanitize-html';

// Interfaces
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

interface SEOAndMarketingTabProps {
  seoAndMarketingData: ISeoMarketing;
  seoAndMarketingError: SeoMarketingError;
  singleTagField: string;
  onSEOAndMarketingChange: (name: keyof ISeoMarketing, value: string | string[]) => void;
  onSingleTagChange: (value: string) => void;
  onAddTag: (tag: string) => void;
  onRemoveTag: (index: number) => void;
}

const SEOAndMarketingTab: React.FC<SEOAndMarketingTabProps> = ({
  seoAndMarketingData,
  seoAndMarketingError,
  singleTagField,
  onSEOAndMarketingChange,
  onSingleTagChange,
  onAddTag,
  onRemoveTag,
}) => {
  // Handle SEO and marketing field changes
  const handleSEOAndMarketing = useCallback(
    (name: keyof ISeoMarketing, value: string) => {
      const sanitizedValue = sanitizeHtml(value, { allowedTags: [] });
      onSEOAndMarketingChange(name, sanitizedValue);
    },
    [onSEOAndMarketingChange]
  );

  // Handle tag input changes
  const handleTagChange = useCallback(
    (value: string) => {
      const sanitizedValue = sanitizeHtml(value, { allowedTags: [] });
      onSingleTagChange(sanitizedValue);
    },
    [onSingleTagChange]
  );

  // Handle adding tags
  const handleAddTag = useCallback(() => {
    const trimmedTag = singleTagField.trim();
    if (trimmedTag) {
      onAddTag(trimmedTag);
      onSingleTagChange(''); // Clear input
    }
  }, [singleTagField, onAddTag, onSingleTagChange]);

  // URL validation for promoVideoUrl
  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold text-orange-600">SEO and Marketing</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* SEO Meta Title */}
        <div className="space-y-1">
          <label htmlFor="seoMetaTitle" className="text-orange-600 font-bold">
            SEO Meta Title
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <PiTextAa className="h-5 w-5 text-stone-400" />
            </div>
            <input
              id="seoMetaTitle"
              name="seoMetaTitle"
              type="text"
              value={seoAndMarketingData.seoMetaTitle || ''}
              onChange={(e) => handleSEOAndMarketing('seoMetaTitle', e.target.value)}
              className={`pl-10 outline-none w-full rounded-lg border ${
                seoAndMarketingError.seoMetaTitle
                  ? 'border-red-500'
                  : seoAndMarketingData.seoMetaTitle
                  ? 'border-orange-500'
                  : 'border-stone-300 dark:border-stone-700'
              } bg-stone-100 dark:bg-stone-800 py-2 px-3 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
              placeholder="e.g., Learn Web Development in 30 Days"
              maxLength={60}
              aria-invalid={!!seoAndMarketingError.seoMetaTitle}
              aria-describedby="seoMetaTitle-error seoMetaTitle-counter"
            />
          </div>
          <div aria-live="polite">
            {seoAndMarketingError.seoMetaTitle && (
              <p
                id="seoMetaTitle-error"
                className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
              >
                <PiWarning size={16} /> {seoAndMarketingError.seoMetaTitle}
              </p>
            )}
            <p
              id="seoMetaTitle-counter"
              className="mt-1 text-xs text-stone-500 dark:text-stone-400"
            >
              {(seoAndMarketingData.seoMetaTitle || '').length}/60 characters
            </p>
          </div>
        </div>

        {/* Promo Video URL */}
        <div className="space-y-1">
          <label htmlFor="promoVideoUrl" className="text-orange-600 font-bold">
            Promo Video URL
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <PiVideo className="h-5 w-5 text-stone-400" />
            </div>
            <input
              id="promoVideoUrl"
              name="promoVideoUrl"
              type="text"
              value={seoAndMarketingData.promoVideoUrl || ''}
              onChange={(e) => handleSEOAndMarketing('promoVideoUrl', e.target.value)}
              className={`pl-10 outline-none w-full rounded-lg border ${
                seoAndMarketingError.promoVideoUrl
                  ? 'border-red-500'
                  : seoAndMarketingData.promoVideoUrl && isValidUrl(seoAndMarketingData.promoVideoUrl)
                  ? 'border-orange-500'
                  : 'border-stone-300 dark:border-stone-700'
              } bg-stone-100 dark:bg-stone-800 py-2 px-3 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
              placeholder="e.g., https://youtube.com/watch?v=promo"
              maxLength={200}
              aria-invalid={!!seoAndMarketingError.promoVideoUrl}
              aria-describedby="promoVideoUrl-error promoVideoUrl-counter"
            />
          </div>
          <div aria-live="polite">
            {seoAndMarketingError.promoVideoUrl && (
              <p
                id="promoVideoUrl-error"
                className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
              >
                <PiWarning size={16} /> {seoAndMarketingError.promoVideoUrl}
              </p>
            )}
            <p
              id="promoVideoUrl-counter"
              className="mt-1 text-xs text-stone-500 dark:text-stone-400"
            >
              {(seoAndMarketingData.promoVideoUrl || '').length}/200 characters
            </p>
          </div>
        </div>

        {/* Tags */}
        <div className="space-y-1 md:col-span-2">
          <label htmlFor="tags" className="text-orange-600 font-bold">
            Tags
          </label>
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <PiTag className="h-5 w-5 text-stone-400" />
              </div>
              <input
                id="tags"
                name="tags"
                type="text"
                value={singleTagField}
                onChange={(e) => handleTagChange(e.target.value)}
                className={`pl-10 outline-none w-full rounded-lg border ${
                  seoAndMarketingError.tags
                    ? 'border-red-500'
                    : singleTagField
                    ? 'border-orange-500'
                    : 'border-stone-300 dark:border-stone-700'
                } bg-stone-100 dark:bg-stone-800 py-2 px-3 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                placeholder="e.g., web development, coding"
                maxLength={50}
                aria-invalid={!!seoAndMarketingError.tags}
                aria-describedby="tags-error tags-counter"
                aria-required="true"
              />
            </div>
            <button
              type="button"
              onClick={handleAddTag}
              disabled={!singleTagField.trim()}
              className="flex items-center gap-2 px-4 py-2 text-stone-100 bg-orange-600 rounded font-bold hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Add tag"
            >
              <PiPlus /> Add
            </button>
          </div>
          <div aria-live="polite">
            {seoAndMarketingError.tags && (
              <p
                id="tags-error"
                className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
              >
                <PiWarning size={16} /> {seoAndMarketingError.tags}
              </p>
            )}
            <p
              id="tags-counter"
              className="mt-1 text-xs text-stone-500 dark:text-stone-400"
            >
              {singleTagField.length}/50 characters
            </p>
          </div>
          <div className="mt-4">
            {seoAndMarketingData.tags.length > 0 ? (
              <ul className="flex flex-wrap gap-2">
                {seoAndMarketingData.tags.map((tag, index) => (
                  <li
                    key={index}
                    className="flex items-center gap-2 border border-orange-600 px-3 py-1 text-orange-600 rounded-full bg-stone-100 dark:bg-stone-800"
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => onRemoveTag(index)}
                      className="text-red-600 hover:text-red-800"
                      aria-label={`Remove tag ${tag}`}
                    >
                      <PiTrash />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-stone-500">No tags added.</p>
            )}
          </div>
        </div>

        {/* SEO Meta Description */}
        <div className="space-y-1 md:col-span-2">
          <label htmlFor="seoMetaDescription" className="text-orange-600 font-bold">
            SEO Meta Description
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 pt-2 flex items-start pointer-events-none">
              <PiTextAa className="h-5 w-5 text-stone-400" />
            </div>
            <textarea
              id="seoMetaDescription"
              name="seoMetaDescription"
              value={seoAndMarketingData.seoMetaDescription || ''}
              onChange={(e) => handleSEOAndMarketing('seoMetaDescription', e.target.value)}
              className={`pl-10 w-full rounded-lg border ${
                seoAndMarketingError.seoMetaDescription
                  ? 'border-red-500'
                  : seoAndMarketingData.seoMetaDescription
                  ? 'border-orange-500'
                  : 'border-stone-300 dark:border-stone-700'
              } bg-stone-100 dark:bg-stone-800 py-2 px-3 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent min-h-[100px]`}
              placeholder="e.g., Master web development with our comprehensive course covering HTML, CSS, and JavaScript."
              maxLength={300}
              aria-invalid={!!seoAndMarketingError.seoMetaDescription}
              aria-describedby="seoMetaDescription-error seoMetaDescription-counter"
            />
          </div>
          <div aria-live="polite">
            {seoAndMarketingError.seoMetaDescription && (
              <p
                id="seoMetaDescription-error"
                className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
              >
                <PiWarning size={16} /> {seoAndMarketingError.seoMetaDescription}
              </p>
            )}
            <p
              id="seoMetaDescription-counter"
              className="mt-1 text-xs text-stone-500 dark:text-stone-400"
            >
              {(seoAndMarketingData.seoMetaDescription || '').length}/300 characters
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SEOAndMarketingTab;
