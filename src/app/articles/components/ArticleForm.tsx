"use client";
import React, { useRef, useEffect, useState, useCallback } from "react";
import { PiBook, PiWarning, PiX, PiTrash, PiPlus } from "react-icons/pi";
import dynamic from "next/dynamic";
import { Editor as TinyMCEEditor } from "@tinymce/tinymce-react";
import { debounce } from "lodash";

const Editor = dynamic(() => import("@tinymce/tinymce-react").then((mod) => mod.Editor), {
  ssr: false,
});

interface ArticleFormProps {
  initialData?: {
    title: string;
    thumbnailUrl: string;
    keywords: string[];
    metaDescription: string;
    visibility: "public" | "private";
    content: string;
  };
  onSubmit: (data: {
    title: string;
    thumbnailUrl: string;
    content: string;
    visibility: "public" | "private";
    meta: {
      keywords: string[];
      description: string;
    };
  }) => Promise<void>;
  onClose: () => void;
  isSubmitting: boolean;
  isEditing?: boolean;
}

export const ArticleForm: React.FC<ArticleFormProps> = ({
  initialData,
  onSubmit,
  onClose,
  isSubmitting,
  isEditing = false,
}) => {
  const editorRef = useRef<TinyMCEEditor | null>(null);
  const [articleTitle, setArticleTitle] = useState(initialData?.title || "");
  const [thumbnailUrl, setThumbnailUrl] = useState(initialData?.thumbnailUrl || "");
  const [keywords, setKeywords] = useState<string[]>(initialData?.keywords || []);
  const [metaDescription, setMetaDescription] = useState(initialData?.metaDescription || "");
  const [visibility, setVisibility] = useState<"public" | "private">(initialData?.visibility || "public");
  const [keywordInput, setKeywordInput] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load initial content into editor
  useEffect(() => {
    if (initialData?.content && editorRef.current) {
      editorRef.current.setContent(initialData.content);
    }
  }, [initialData?.content]);

  // Handlers for form inputs
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setArticleTitle(e.target.value);
    if (errors.title) {
      setErrors((prev) => ({ ...prev, title: "" }));
    }
  };

  const handleThumbnailUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setThumbnailUrl(e.target.value);
    if (errors.thumbnailUrl) {
      setErrors((prev) => ({ ...prev, thumbnailUrl: "" }));
    }
  };

  const handleKeywordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setKeywordInput(e.target.value);
    if (errors.keywords) {
      setErrors((prev) => ({ ...prev, keywords: "" }));
    }
  };

  const handleMetaDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMetaDescription(e.target.value);
    if (errors.metaDescription) {
      setErrors((prev) => ({ ...prev, metaDescription: "" }));
    }
  };

  const handleVisibilityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVisibility(e.target.value as "public" | "private");
    if (errors.visibility) {
      setErrors((prev) => ({ ...prev, visibility: "" }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!articleTitle.trim()) {
      newErrors.title = "Article title is required.";
    } else if (articleTitle.length > 100) {
      newErrors.title = "Title cannot exceed 100 characters.";
    }

    if (!thumbnailUrl.trim()) {
      newErrors.thumbnailUrl = "Thumbnail URL is required.";
    } else {
      try {
        new URL(thumbnailUrl);
      } catch {
        newErrors.thumbnailUrl = "Please enter a valid URL.";
      }
    }

    if (keywords.length === 0) {
      newErrors.keywords = "At least one keyword is required.";
    } else if (keywords.length > 10) {
      newErrors.keywords = "Cannot have more than 10 keywords.";
    } else if (keywords.some((k) => k.length > 50)) {
      newErrors.keywords = "Each keyword cannot exceed 50 characters.";
    }

    if (!metaDescription.trim()) {
      newErrors.metaDescription = "Meta description is required.";
    } else if (metaDescription.length > 160) {
      newErrors.metaDescription = "Meta description cannot exceed 160 characters.";
    }

    if (!visibility) {
      newErrors.visibility = "Please select visibility.";
    }

    if (!editorRef.current?.getContent()?.trim()) {
      newErrors.content = "Article content cannot be empty.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      await onSubmit({
        title: articleTitle,
        thumbnailUrl,
        content: editorRef.current!.getContent(),
        visibility,
        meta: {
          keywords,
          description: metaDescription,
        },
      });
      // Clear localStorage after successful submission
      localStorage.removeItem("articleFormData");
      // Reset form
      setArticleTitle("");
      setThumbnailUrl("");
      setKeywords([]);
      setMetaDescription("");
      setVisibility("public");
      setKeywordInput("");
      if (editorRef.current) {
        editorRef?.current?.setContent("");
      }
    } catch (error) {
      setErrors({ submit: "Failed to submit article. Please try again." });
    }
  };

  const handleAddKeyword = (e: React.KeyboardEvent<HTMLInputElement> | React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const trimmedKeyword = keywordInput.trim();
    if (trimmedKeyword && !keywords.includes(trimmedKeyword) && trimmedKeyword.length <= 50) {
      setKeywords([...keywords, trimmedKeyword]);
      setKeywordInput("");
    }
  };

  const handleRemoveKeyword = (index: number) => {
    setKeywords(keywords.filter((_, i) => i !== index));
  };

  // Debounced editor change handler
  const debouncedSaveToLocalStorage = useCallback(
    debounce((content: string) => {
      localStorage.setItem(
        "articleFormData",
        JSON.stringify({
          title: articleTitle,
          thumbnail: thumbnailUrl,
          keywords,
          metaDesc: metaDescription,
          visibility,
          content,
        })
      );
    }, 500),
    [articleTitle, thumbnailUrl, keywords, metaDescription, visibility]
  );

  return (
    <div className="fixed inset-0 bg-stone-900 bg-opacity-75 flex items-center justify-center p-4 backdrop-blur-sm transition-opacity duration-300 z-50">
      <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative transform transition-all duration-300 scale-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-stone-500 hover:text-stone-700 dark:text-stone-300 dark:hover:text-stone-100 transition-colors duration-200"
          aria-label="Close form"
        >
          <PiX size={28} />
        </button>
        <form onSubmit={handleSubmit} className="p-8">
          <h1 className="text-3xl font-bold text-stone-800 dark:text-stone-100 mb-8">
            {isEditing ? "Edit Article" : "Create a New Article"}
          </h1>

          {/* Article Title */}
          <div className="mb-6">
            <label htmlFor="articleTitle" className="block text-sm font-medium text-stone-600 dark:text-stone-300 mb-2">
              Article Title
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <PiBook className="h-5 w-5 text-stone-400" />
              </div>
              <input
                id="articleTitle"
                name="articleTitle"
                type="text"
                required
                value={articleTitle}
                onChange={handleTitleChange}
                className={`pl-10 w-full rounded-lg border ${
                  errors.title ? "border-red-500" : "border-stone-300 dark:border-stone-600"
                } bg-stone-50 dark:bg-stone-800 py-3 px-4 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors duration-200`}
                placeholder="e.g., Introduction to JavaScript"
                maxLength={100}
                aria-invalid={!!errors.title}
                aria-describedby="articleTitle-error articleTitle-counter"
              />
            </div>
            <div aria-live="polite">
              {errors.title && (
                <p id="articleTitle-error" className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <PiWarning size={16} /> {errors.title}
                </p>
              )}
              <p id="articleTitle-counter" className="mt-2 text-xs text-stone-500 dark:text-stone-400">
                {articleTitle.length}/100 characters
              </p>
            </div>
          </div>

          {/* Thumbnail URL */}
          <div className="mb-6">
            <label htmlFor="thumbnailUrl" className="block text-sm font-medium text-stone-600 dark:text-stone-300 mb-2">
              Thumbnail URL
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <PiBook className="h-5 w-5 text-stone-400" />
              </div>
              <input
                id="thumbnailUrl"
                name="thumbnailUrl"
                type="text"
                required
                value={thumbnailUrl}
                onChange={handleThumbnailUrlChange}
                className={`pl-10 w-full rounded-lg border ${
                  errors.thumbnailUrl ? "border-red-500" : "border-stone-300 dark:border-stone-600"
                } bg-stone-50 dark:bg-stone-800 py-3 px-4 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors duration-200`}
                placeholder="e.g., https://example.com/thumbnail.jpg"
                maxLength={500}
                aria-invalid={!!errors.thumbnailUrl}
                aria-describedby="thumbnailUrl-error thumbnailUrl-counter"
              />
            </div>
            <div aria-live="polite">
              {errors.thumbnailUrl && (
                <p id="thumbnailUrl-error" className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <PiWarning size={16} /> {errors.thumbnailUrl}
                </p>
              )}
              <p id="thumbnailUrl-counter" className="mt-2 text-xs text-stone-500 dark:text-stone-400">
                {thumbnailUrl.length}/500 characters
              </p>
            </div>
          </div>

          {/* Keywords */}
          <div className="mb-6">
            <label htmlFor="keywords" className="block text-sm font-medium text-stone-600 dark:text-stone-300 mb-2">
              Keywords (Press Enter or click Add)
            </label>
            <div className="relative flex items-center gap-4">
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <PiBook className="h-5 w-5 text-stone-400" />
                </div>
                <input
                  id="keywords"
                  name="keywords"
                  type="text"
                  value={keywordInput}
                  onChange={handleKeywordInputChange}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddKeyword(e);
                  }}
                  className={`pl-10 w-full rounded-lg border ${
                    errors.keywords ? "border-red-500" : "border-stone-300 dark:border-stone-600"
                  } bg-stone-50 dark:bg-stone-800 py-3 px-4 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors duration-200`}
                  placeholder="e.g., JavaScript, Programming"
                  maxLength={50}
                  aria-invalid={!!errors.keywords}
                  aria-describedby="keywords-error keywords-counter keywords-instruction"
                />
                <p id="keywords-instruction" className="sr-only">
                  Enter a keyword and press Enter or click the Add button to include it.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddKeyword}
                className="py-3 px-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 dark:from-orange-400 dark:to-orange-500 dark:hover:from-orange-500 dark:hover:to-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors duration-200"
                aria-label="Add keyword"
              >
                <PiPlus size={20} />
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {keywords.map((keyword, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-orange-100 text-orange-800 dark:bg-orange-700 dark:text-orange-100 transition-colors duration-200"
                >
                  {keyword}
                  <button
                    type="button"
                    onClick={() => handleRemoveKeyword(index)}
                    className="ml-2 text-orange-600 hover:text-orange-800 dark:text-orange-300 dark:hover:text-orange-100"
                    aria-label={`Remove ${keyword}`}
                  >
                    <PiTrash size={16} />
                  </button>
                </span>
              ))}
            </div>
            <div aria-live="polite">
              {errors.keywords && (
                <p id="keywords-error" className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <PiWarning size={16} /> {errors.keywords}
                </p>
              )}
              <p id="keywords-counter" className="mt-2 text-xs text-stone-500 dark:text-stone-400">
                {keywords.length}/10 keywords
              </p>
            </div>
          </div>

          {/* Meta Description */}
          <div className="mb-6">
            <label htmlFor="metaDescription" className="block text-sm font-medium text-stone-600 dark:text-stone-300 mb-2">
              Meta Description
            </label>
            <textarea
              id="metaDescription"
              name="metaDescription"
              required
              value={metaDescription}
              onChange={handleMetaDescriptionChange}
              className={`w-full rounded-lg border ${
                errors.metaDescription ? "border-red-500" : "border-stone-300 dark:border-stone-600"
              } bg-stone-50 dark:bg-stone-800 py-3 px-4 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors duration-200`}
              placeholder="e.g., Learn the basics of JavaScript programming in this comprehensive guide."
              maxLength={160}
              rows={4}
              aria-invalid={!!errors.metaDescription}
              aria-describedby="metaDescription-error metaDescription-counter"
            />
            <div aria-live="polite">
              {errors.metaDescription && (
                <p id="metaDescription-error" className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <PiWarning size={16} /> {errors.metaDescription}
                </p>
              )}
              <p id="metaDescription-counter" className="mt-2 text-xs text-stone-500 dark:text-stone-400">
                {metaDescription.length}/160 characters
              </p>
            </div>
          </div>

          {/* Visibility */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-stone-600 dark:text-stone-300 mb-2">
              Article Visibility
            </label>
            <div className="flex gap-6">
              <label className="flex items-center bg-stone-50 dark:bg-stone-800 px-4 py-2 rounded-lg border border-stone-300 dark:border-stone-600 hover:border-orange-500 transition-colors duration-200">
                <input
                  type="radio"
                  name="visibility"
                  value="public"
                  checked={visibility === "public"}
                  onChange={handleVisibilityChange}
                  className="h-5 w-5 text-orange-500 focus:ring-orange-500 border-stone-300 dark:border-stone-600 transition-colors duration-200"
                  aria-describedby="visibility-error"
                />
                <span className="ml-2 text-sm text-stone-600 dark:text-stone-300">Public</span>
              </label>
              <label className="flex items-center bg-stone-50 dark:bg-stone-800 px-4 py-2 rounded-lg border border-stone-300 dark:border-stone-600 hover:border-orange-500 transition-colors duration-200">
                <input
                  type="radio"
                  name="visibility"
                  value="private"
                  checked={visibility === "private"}
                  onChange={handleVisibilityChange}
                  className="h-5 w-5 text-orange-500 focus:ring-orange-500 border-stone-300 dark:border-stone-600 transition-colors duration-200"
                  aria-describedby="visibility-error"
                />
                <span className="ml-2 text-sm text-stone-600 dark:text-stone-300">Private</span>
              </label>
            </div>
            {errors.visibility && (
              <p id="visibility-error" className="mt-2 text-sm text-red-600 flex items-center gap-1">
                <PiWarning size={16} /> {errors.visibility}
              </p>
            )}
          </div>

          {/* Editor */}
          <div className="mb-6">
            <label htmlFor="editor" className="block text-sm font-medium text-stone-600 dark:text-stone-300 mb-2">
              Article Content
            </label>
            <Editor
              apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY || "us4v6pk6mj0x3uaijcj4k7c6jmfq99vom2z183e9s6o3i56c"}
              onInit={(_evt, editor) => {
                editorRef.current = editor;
                const savedData = localStorage.getItem("articleFormData");
                if (!isEditing && savedData) {
                  const { content } = JSON.parse(savedData);
                  if (content) editor.setContent(content);
                }
              }}
              initialValue={initialData?.content}
              onEditorChange={debouncedSaveToLocalStorage}
              init={{
                height: 500,
                menubar: true,
                plugins: [
                      "advlist",
                      "autolink",
                      "lists",
                      "link",
                      "image",
                      "charmap",
                      "preview",
                      "anchor",
                      "searchreplace",
                      "visualblocks",
                      "code",
                      "fullscreen",
                      "insertdatetime",
                      "media",
                      "table",
                      "code",
                      "help",
                      "wordcount",
                    ],
                toolbar:
                  "undo redo | blocks | bold italic underline strikethrough | forecolor backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image media table | codesample emoticons | formatpainter casechange | checklist | pagebreak | a11ycheck | preview fullscreen | save | help",
                content_style: `
                  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
                  body { font-family: 'Inter', sans-serif; font-size: 16px; color: #1f2937; }
                  h1, h2, h3, h4, h5, h6 { font-weight: 700; color: #111827; }
                  a { color: #f97316; }
                `,
                autoresize_bottom_margin: 20,
                image_caption: true,
                quickbars_selection_toolbar: "bold italic | quicklink h2 h3 blockquote",
                quickbars_insert_toolbar: "image media quicktable",
                powerpaste_word_import: "clean",
                powerpaste_html_import: "clean",
              }}
              aria-label="Article content editor"
              aria-describedby="content-error"
            />
            {errors.content && (
              <p id="content-error" className="mt-2 text-sm text-red-600 flex items-center gap-1">
                <PiWarning size={16} /> {errors.content}
              </p>
            )}
          </div>

          {/* Submission Error */}
          {errors.submit && (
            <div
              className="p-4 rounded-lg mb-6 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 transition-opacity duration-200"
              aria-live="polite"
            >
              {errors.submit}
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="py-3 px-6 rounded-lg bg-stone-200 text-stone-700 dark:bg-stone-700 dark:text-stone-200 font-semibold hover:bg-stone-300 dark:hover:bg-stone-600 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`py-3 px-6 rounded-lg text-white font-semibold ${
                isSubmitting
                  ? "bg-orange-300 cursor-not-allowed"
                  : "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 dark:from-orange-400 dark:to-orange-500 dark:hover:from-orange-500 dark:hover:to-orange-600"
              } focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors duration-200 flex items-center gap-2`}
            >
              {isSubmitting ? (
                <>
                  <span className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
                  {isEditing ? "Updating..." : "Submitting..."}
                </>
              ) : isEditing ? (
                "Update Article"
              ) : (
                "Submit Article"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};