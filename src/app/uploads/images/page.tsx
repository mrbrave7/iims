"use client";
import { useAdminContext } from "@/app/Context/AdminProvider";
import { usePopupContext } from "@/app/Context/ToastProvider";
import { useRouter } from "next/navigation";
import { useRef, useState, useEffect, useCallback, useMemo } from "react";
import { PiPlus, PiX, PiClipboard } from "react-icons/pi";
import { RiImageAddLine } from "react-icons/ri";

interface ImageData {
  fileId: string;
  name: string;
  url: string;
  filePath: string;
  imageType:string
}

interface ApiResponse {
  imagesFiles: ImageData[];
  [key: string]: any;
}

const isApiResponse = (data: any): data is ApiResponse => {
  return Array.isArray(data?.imagesFiles);
};

export default function ImageUploadPage(): React.ReactElement {
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const pickerRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [searchField, setSearchField] = useState("");
  const [uploadedImages, setUploadedImages] = useState<ImageData[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageName, setImageName] = useState("");
  const [imageType, setImageType] = useState("");
  const imageTypes = ['thumbnail', 'avatar', 'documents', 'banner'];

  const router = useRouter()


  const { Popup } = usePopupContext();
  const toast = Popup();
  const { admin } = useAdminContext()

  // Memoized filtered images
  const filteredImages = useMemo(() => {
    if (searchField === "") {
      return uploadedImages;
    }
    return uploadedImages.filter(img =>
      img.name.toLowerCase().includes(searchField.toLowerCase())
    );
  }, [uploadedImages, searchField]);

  // Fetch images with proper typing and validation
  const fetchUploadedImages = useCallback(async () => {
    // Validate admin before making the request
    if (!admin?.id || !admin?.role) {
      router.push("/")
      toast.error("Please Loggin First")
      throw new Error("User authentication required");
    }
    setIsFetching(true);
    toast.loading("Fetching Images ...");
    setError(null);
    try {
      const response = await fetch("/api/uploads/images", {
        headers: {
          id: admin?.id,
          role: admin?.role
        }
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      if (!isApiResponse(data)) {
        throw new Error("Invalid API response structure");
      }

      setUploadedImages(data.imagesFiles);
      toast.success("Images Are Available");
    } catch (error) {
      console.error("Fetch error:", error);
      setError("Failed to load images");
      toast.error("Failed to fetch images");
    } finally {
      setIsFetching(false);
    }
  }, []);

  useEffect(() => {
    fetchUploadedImages();
  }, []);

  // Clean up object URLs when previews change or component unmounts
  useEffect(() => {
    return () => {
      imagePreviews.forEach(URL.revokeObjectURL);
    };
  }, [imagePreviews]);

  // File handling with duplicate check
  const handleFiles = (files: FileList) => {
    const newFiles = Array.from(files).filter(file =>
      file.type.startsWith('image/')
    );

    if (newFiles.length !== files.length) {
      toast.error("Only image files are allowed");
    }

    // Check for duplicates
    const uniqueNewFiles = newFiles.filter(newFile =>
      !images.some(existingFile =>
        existingFile.name === newFile.name &&
        existingFile.size === newFile.size
      )
    );

    if (uniqueNewFiles.length < newFiles.length) {
      toast.warning("Some duplicate files were skipped");
    }

    setImages(prev => [...prev, ...uniqueNewFiles]);
    setImagePreviews(prev => [
      ...prev,
      ...uniqueNewFiles.map(file => URL.createObjectURL(file))
    ]);
  };

  const handleRemoveImage = (index: number) => {
    URL.revokeObjectURL(imagePreviews[index]);
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  // Upload handler with improved state management
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (images.length === 0) {
      toast.error("Please select at least one image");
      return;
    }
    if (!imageName) {
      toast.error("Please provide an image name");
      return;
    }
    if (!imageType) {
      toast.error("Please select an image type");
      return;
    }

    toast.loading("Uploading images...");
    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      images.forEach(image => formData.append("images", image));
      formData.append("imageName", imageName);
      formData.append("imageType", imageType);

      const response = await fetch("/api/uploads/images", {
        method: "POST",
        headers: {
          id: admin?.id
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`);
      }

      const data = await response.json();
      if (!isApiResponse(data)) {
        throw new Error("Invalid API response structure");
      }

      setUploadedImages(prev => [...data.imagesFiles, ...prev]);
      setImages([]);
      setImagePreviews([]);
      setImageName("");
      setImageType("");
      setShowUploadForm(false);
      toast.success("Images uploaded successfully!");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Upload failed");
      setError("Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  // Delete handler
  const handleDeleteImage = async (id: string) => {
    toast.loading("Deleting image...");
    setIsFetching(true);
    setError(null);

    try {
      const response = await fetch(`/api/uploads/images/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`Delete failed: ${response.status}`);
      }
      setUploadedImages(prev => prev.filter(img => img.fileId !== id));
      toast.success("Image deleted successfully!");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Delete failed");
      setError("Failed to delete image");
    } finally {
      setIsFetching(false);
    }
  };

  return (
    <main className="min-h-screen flex bg-gradient-to-br from-orange-200 via-orange-300 to-orange-400 dark:from-stone-800 dark:via-stone-900 dark:to-black">
      <section className="flex-1 p-6 md:p-8 max-w-4xl mx-auto bg-stone-100/80 dark:bg-stone-900/90 min-w-xl p-6 md:p-8 w-full max-w-4xl rounded-lg shadow-lg border border-stone-200 dark:border-stone-700">
        {/* Search and controls */}
        <h1 className="text-3xl text-orange-500 mb-4 font-bold">Images</h1>
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <input
            type="text"
            placeholder="Search images..."
            value={searchField}
            onChange={(e) => setSearchField(e.target.value)}
            className="flex-1 p-2 border-2 border-orange-600 text-stone-900 dark:text-stone-100 rounded bg-white dark:bg-stone-800"
            aria-label="Search images"
          />
          <button
            onClick={() => setShowUploadForm(true)}
            className="bg-orange-600 text-white py-2 px-4 rounded flex items-center gap-2 hover:bg-orange-700 transition-colors"
            disabled={isFetching}
            aria-label="Add images"
          >
            <PiPlus /> Add Images
          </button>
        </div>

        {/* Error display */}
        {error && (
          <div className="bg-red-100 dark:bg-red-900/30 p-4 mb-4 rounded border-l-4 border-red-500">
            {error}
          </div>
        )}

        {/* Loading state */}
        {isFetching && !showUploadForm && (
          <div className="flex justify-center my-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
          </div>
        )}

        {/* Images table */}
        {filteredImages.length > 0 ? (
          <div className="overflow-x-auto rounded-lg border border-stone-200 dark:border-stone-700">
            <table className="w-full">
              <thead className="bg-orange-600 text-stone-900 dark:text-stone-100">
                <tr>
                  <th className="p-3 text-left">Preview</th>
                  <th className="p-3 text-left">Name</th>
                  <th className="p-3 text-left">Type</th>
                  <th className="p-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredImages.map((img) => (
                  <tr
                    key={img.fileId}
                    className="border-t border-stone-200 dark:border-stone-700 hover:bg-stone-100/50 dark:hover:bg-stone-800/50"
                  >
                    <td className="p-3">
                      <img
                        src={img.url}
                        alt={img.name}
                        className="w-12 h-12 object-cover rounded"
                        loading="lazy"
                      />
                    </td>
                    <td className="p-3 max-w-xs truncate text-stone-900 dark:text-stone-100" title={img.name}>
                      {img.name}
                    </td>
                    <td className="p-3 max-w-xs truncate text-stone-900 dark:text-stone-100" title={img.name}>
                      {img.imageType}
                    </td>
                    <td className="p-3 flex gap-2">
                      <button
                        onClick={() => { navigator.clipboard.writeText(img.url); toast.success("Image URL Copied"); }}
                        className="text-orange-600 hover:text-orange-800 transition-colors"
                        title="Copy URL"
                        aria-label="Copy image URL"
                      >
                        <PiClipboard size={20} />
                      </button>
                      <button
                        onClick={() => handleDeleteImage(img.fileId)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                        title="Delete"
                        disabled={isFetching}
                        aria-label="Delete image"
                      >
                        <PiX size={20} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 bg-white/50 dark:bg-stone-800/30 rounded-lg">
            <RiImageAddLine className="mx-auto text-4xl text-stone-400 mb-4" />
            <p className="text-stone-500 dark:text-stone-400 mb-4">
              {searchField ? "No matching images found" : "No images uploaded yet"}
            </p>
            <button
              onClick={() => setShowUploadForm(true)}
              className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 transition-colors"
              aria-label="Upload images"
            >
              Upload Images
            </button>
          </div>
        )}

        {/* Upload Modal */}
        {showUploadForm && (
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            role="dialog"
            aria-modal="true"
          >
            <div className="bg-white dark:bg-stone-900 rounded-xl shadow-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-orange-600">Upload Images</h2>
                <button
                  onClick={() => setShowUploadForm(false)}
                  className="text-stone-500 hover:text-stone-700"
                  aria-label="Close upload modal"
                >
                  <PiX size={24} />
                </button>
              </div>

              <form onSubmit={handleUpload} className="space-y-4">
                <div>
                  <label htmlFor="imageName" className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                    Image Name
                  </label>
                  <input
                    id="imageName"
                    type="text"
                    value={imageName}
                    onChange={(e) => setImageName(e.target.value)}
                    placeholder="Enter image name"
                    className="w-full p-2 border-2 border-orange-600 rounded bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                    required
                    aria-label="Image name"
                  />
                </div>
                <div>
                  <label htmlFor="imageType" className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                    Image Type
                  </label>
                  <select
                    id="imageType"
                    value={imageType}
                    onChange={(e) => setImageType(e.target.value)}
                    className="w-full p-2 border-2 border-orange-600 rounded bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                    required
                    aria-label="Image type"
                  >
                    <option value="" disabled>Select image type</option>
                    {imageTypes.map((type) => (
                      <option key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div
                  ref={dropZoneRef}
                  onClick={() => pickerRef.current?.click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                      setIsDragging(false);
                    }
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
                  }}
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${isDragging ? 'border-orange-500 bg-orange-50 dark:bg-stone-800' : 'border-orange-400'
                    }`}
                  aria-label="Image drop zone"
                >
                  <RiImageAddLine className="mx-auto text-4xl text-orange-500 mb-2" />
                  <p className="text-stone-600 dark:text-stone-300">
                    {isDragging ? 'Drop images here' : 'Click to select or drag and drop'}
                  </p>
                  <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
                    Supports: JPG, PNG, WEBP
                  </p>
                </div>

                <input
                  type="file"
                  ref={pickerRef}
                  onChange={(e) => e.target.files && handleFiles(e.target.files)}
                  multiple
                  accept="image/*"
                  className="hidden"
                />

                {/* Image previews */}
                {images.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 max-h-60 overflow-y-auto p-2">
                    {images.map((_, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={imagePreviews[index]}
                          alt={`Preview ${index}`}
                          className="w-full h-20 object-cover rounded"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          aria-label="Remove image"
                        >
                          <PiX size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowUploadForm(false)}
                    className="flex-1 py-2 px-4 border border-stone-300 rounded hover:bg-stone-100 transition-colors"
                    disabled={isUploading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 px-4 bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors disabled:opacity-50"
                    disabled={isUploading || images.length === 0}
                  >
                    {isUploading ? 'Uploading...' : 'Upload'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}