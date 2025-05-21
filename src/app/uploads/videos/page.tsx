"use client";
import { useRef, useState, useEffect, useCallback } from "react";
import { PiPlus, PiX, PiClipboard, PiPlay, PiArrowsClockwise } from "react-icons/pi";
import { RiVideoAddLine } from "react-icons/ri";
import Head from "next/head";
import { useAdminContext } from "@/app/Context/AdminProvider";
import { CldVideoPlayer } from "next-cloudinary";
import "next-cloudinary/dist/cld-video-player.css";
import FocusTrap from "focus-trap-react";
import { useRouter } from "next/navigation";

// Custom debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

// Interface aligned with MongoDB schema and API response
interface UploadedVideo {
  _id: string;
  videoName: string;
  publicId: string;
  videoUrl: {
    secureUrl: string;
    playbackUrl: string | null;
    signedUrl?: string;
  };
  videoType: "module" | "promo";
  isPremium: boolean;
  accessMode: "public" | "authenticated";
  type: "upload" | "private";
  duration: number | null;
  format: string | null;
  width: number | null;
  height: number | null;
  processing: boolean;
  createdAt: string;
}

// Retry logic for API calls
async function withRetry<T>(
  fn: () => Promise<T>,
  retries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: any;
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      if (error.status && [429, 500, 503].includes(error.status)) {
        await new Promise((resolve) => setTimeout(resolve, delayMs * Math.pow(2, i)));
      } else {
        break;
      }
    }
  }
  throw lastError;
}

export default function VideoUploadPage(): React.ReactElement {
  const [video, setVideo] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const pickerRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const [showUploadForm, setShowUploadForm] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [searchField, setSearchField] = useState<string>("");
  const debouncedSearchField = useDebounce(searchField, 300);
  const [uploadedVideos, setUploadedVideos] = useState<UploadedVideo[]>([]);
  const [videoName, setVideoName] = useState<string>("");
  const [videoType, setVideoType] = useState<"module" | "promo">("module");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<UploadedVideo | null>(null);
  const [showPlayModal, setShowPlayModal] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const limit = 10;
  const { admin } = useAdminContext();
  const router = useRouter();

  // SEO Metadata
  const pageTitle = "Video Upload Dashboard";
  const pageDescription = "Upload and manage your video content securely.";

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  // Fetch videos with pagination
  useEffect(() => {
    if (admin?._id) {
      const fetchVideos = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const response = await withRetry(() =>
            fetch(`/api/uploads/videos/${admin._id}?page=${page}&limit=${limit}`, {
              credentials: "include",
            })
          );
          if (!response.ok) {
            throw new Error(`Failed to fetch videos: ${response.status}`);
          }
          const { allVideos, pagination } = await response.json();
          console.debug("Fetched videos:", allVideos);
          setUploadedVideos(allVideos);
          setTotalPages(pagination.totalPages);
        } catch (error: any) {
          console.error("Error fetching videos:", error);
          setError("Failed to load videos. Please try again.");
        } finally {
          setIsLoading(false);
        }
      };
      fetchVideos();
    }
  }, [admin?._id, page, limit]);

  // Cleanup video preview
  useEffect(() => {
    return () => {
      if (videoPreview) URL.revokeObjectURL(videoPreview);
    };
  }, [videoPreview]);

  // Handlers
  const handlePickVideo = useCallback(() => {
    pickerRef.current?.click();
  }, []);

  const onVideoChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      handleFile(e.target.files[0]);
    }
  }, []);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("video/")) {
      setError("Only video files are allowed (e.g., MP4, WebM, MOV).");
      return;
    }
    const allowedTypes = ["video/mp4", "video/webm", "video/quicktime"];
    if (!allowedTypes.includes(file.type)) {
      setError("Unsupported video format. Use MP4, WebM, or MOV.");
      return;
    }
    const maxFileSize = 100 * 1024 * 1024; // 100 MB
    if (file.size > maxFileSize) {
      setError("Video file too large. Maximum size is 100 MB.");
      return;
    }
    if (videoPreview) URL.revokeObjectURL(videoPreview);
    setVideo(file);
    setVideoPreview(URL.createObjectURL(file));
  }, [videoPreview]);

  const handleRemoveVideo = useCallback(() => {
    if (videoPreview) URL.revokeObjectURL(videoPreview);
    setVideo(null);
    setVideoPreview(null);
  }, [videoPreview]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files?.[0]) {
        handleFile(e.dataTransfer.files[0]);
      }
    },
    [handleFile]
  );

  const handleUpload = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setError(null);
      if (!video) {
        setError("Please select a video file.");
        return;
      }
      if (!videoName.trim()) {
        setError("Please provide a name for your video.");
        return;
      }
      if (videoName.length > 255) {
        setError("Video name must be ≤ 255 characters.");
        return;
      }
      if (!videoType) {
        setError("Please select a video type.");
        return;
      }
      setIsLoading(true);
      try {
        const formData = new FormData();
        formData.append("video", video);
        formData.append("videoName", videoName.trim());
        formData.append("videoType", videoType);

        const response = await withRetry(() =>
          fetch(`/api/uploads/videos/${admin?._id}`, {
            method: "POST",
            credentials: "include",
            body: formData,
          })
        );
        if (!response.ok) {
          const { error } = await response.json();
          throw new Error(error || `Upload failed: ${response.status}`);
        }
        const { newVideo } = await response.json();
        setUploadedVideos((prev) => [newVideo, ...prev]);
        setVideo(null);
        setVideoPreview(null);
        setVideoName("");
        setVideoType("module");
        setShowUploadForm(false);
      } catch (error: any) {
        console.error("Upload error:", error);
        setError(error.message.includes("413") ? "Video file too large. Maximum 100 MB." : error.message || "Upload failed. Please try again.");
      } finally {
        setIsLoading(false);
      }
    },
    [video, videoName, videoType, admin?._id]
  );

  const handleCopyUrl = useCallback(
    async (url: string) => {
      try {
        await navigator.clipboard.writeText(url);
        alert("URL copied to clipboard!");
      } catch (error) {
        console.error("Copy failed:", error);
        setError("Failed to copy URL. Please try manually.");
      }
    },
    []
  );

  const handlePlayVideo = useCallback((video: UploadedVideo) => {
    setSelectedVideo(video);
    setShowPlayModal(true);
  }, []);

  const handleClosePlayModal = useCallback(() => {
    setSelectedVideo(null);
    setShowPlayModal(false);
  }, []);

  const handleDeleteVideo = useCallback(
    async (videoId: string) => {
      if (!window.confirm("Are you sure you want to delete this video?")) return;
      setIsLoading(true);
      setError(null);
      try {
        const response = await withRetry(() =>
          fetch(`/api/uploads/videos/${admin?._id}?videoId=${videoId}`, {
            method: "DELETE",
            credentials: "include",
          })
        );
        if (!response.ok) {
          const { error } = await response.json();
          throw new Error(error || `Delete failed: ${response.status}`);
        }
        setUploadedVideos((prev) => prev.filter((v) => v._id !== videoId));
      } catch (error: any) {
        console.error("Delete error:", error);
        setError(error.message || "Failed to delete video. Please try again.");
      } finally {
        setIsLoading(false);
      }
    },
    [admin?._id]
  );

  const handleRefreshVideos = useCallback(() => {
    if (admin?._id) {
      setPage(1);
      setUploadedVideos([]);
      // Trigger useEffect to refetch
    }
  }, [admin?._id]);

  const filteredVideos = uploadedVideos.filter((video) =>
    video.videoName.toLowerCase().includes(debouncedSearchField.toLowerCase())
  );

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-200 via-orange-300 to-orange-400 dark:from-stone-800 dark:via-stone-900 dark:to-black">
        <div
          className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 dark:border-orange-500"
          aria-label="Loading"
        ></div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:type" content="website" />
      </Head>

      <main
        className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-200 via-orange-300 to-orange-400 dark:from-stone-800 dark:via-stone-900 dark:to-black px-4 py-8"
        role="main"
      >
        <section
          className="bg-stone-100/80 dark:bg-stone-900/90 p-6 md:p-8 w-full max-w-5xl rounded-lg shadow-lg border border-stone-200 dark:border-stone-700"
          aria-labelledby="video-upload-heading"
        >
          <h1
            id="video-upload-heading"
            className="text-3xl text-orange-500 mb-6 font-bold"
          >
            Video Upload Dashboard
          </h1>

          {/* Search and controls */}
          <div
            className="flex flex-col md:flex-row items-center justify-between bg-stone-100 dark:bg-stone-800 p-4 mb-6 rounded-lg gap-4 border border-stone-200 dark:border-stone-700"
            role="toolbar"
          >
            <div className="flex-1">
              <label htmlFor="video-search" className="sr-only">
                Search videos by name
              </label>
              <input
                id="video-search"
                type="text"
                placeholder="Search videos by name"
                value={searchField}
                onChange={(e) => setSearchField(e.target.value.trim())}
                className="w-full border-2 border-orange-600 dark:border-orange-500 p-2 rounded focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 placeholder-stone-500 dark:placeholder-stone-400"
                aria-label="Search videos by name"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleRefreshVideos}
                className="bg-orange-600 dark:bg-orange-700 text-white dark:text-orange-100 py-2 px-4 rounded hover:bg-orange-700 dark:hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
                aria-label="Refresh video list"
              >
                <PiArrowsClockwise size={20} aria-hidden="true" />
              </button>
              <button
                onClick={() => setShowUploadForm(true)}
                className="bg-orange-600 dark:bg-orange-700 flex items-center justify-center gap-2 text-white dark:text-orange-100 py-2 px-4 rounded hover:bg-orange-700 dark:hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
                aria-label="Add new video"
              >
                <PiPlus size={20} aria-hidden="true" /> Add Video
              </button>
            </div>
          </div>

          {/* Error display */}
          {error && (
            <div
              className="bg-red-100 dark:bg-red-900/30 border-l-4 border-red-500 dark:border-red-400 text-red-700 dark:text-red-200 p-4 mb-6 rounded"
              role="alert"
              aria-live="assertive"
            >
              <p>{error}</p>
            </div>
          )}

          {/* Loading indicator */}
          {isLoading && (
            <div
              className="flex justify-center my-6"
              aria-busy="true"
            >
              <div
                className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 dark:border-orange-500"
                aria-label="Loading"
              ></div>
            </div>
          )}

          {/* Videos table */}
          {!isLoading && (
            <div className="overflow-x-auto">
              <table
                className="w-full text-left border-collapse"
                aria-describedby="videos-table-caption"
              >
                <caption id="videos-table-caption" className="sr-only">
                  List of uploaded videos
                </caption>
                <thead>
                  <tr className="bg-orange-600 dark:bg-orange-700 text-white dark:text-orange-100">
                    <th scope="col" className="p-3 font-semibold">
                      Name
                    </th>
                    <th scope="col" className="p-3 font-semibold">
                      Type
                    </th>
                    <th scope="col" className="p-3 font-semibold">
                      Status
                    </th>
                    <th scope="col" className="p-3 font-semibold">
                      URL
                    </th>
                    <th scope="col" className="p-3 font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVideos.map((video) => (
                    <tr
                      key={video._id}
                      className="border-b border-stone-200 dark:border-stone-700 hover:bg-stone-100/50 dark:hover:bg-stone-800/50"
                      role="row"
                    >
                      <th
                        scope="row"
                        className="p-3 text-stone-900 dark:text-stone-100 font-medium"
                      >
                        {video.videoName}
                      </th>
                      <td className="p-3 text-stone-700 dark:text-stone-300">
                        {video.videoType.charAt(0).toUpperCase() +
                          video.videoType.slice(1)}
                      </td>
                      <td className="p-3 text-stone-700 dark:text-stone-300">
                        {video.processing ? "Processing" : "Ready"}
                      </td>
                      <td className="p-3 text-stone-700 dark:text-stone-300">
                        <span
                          className="truncate max-w-[200px] inline-block"
                          title={
                            video.videoUrl.signedUrl ||
                            video.videoUrl.playbackUrl ||
                            video.videoUrl.secureUrl
                          }
                        >
                          {(
                            video.videoUrl.signedUrl ||
                            video.videoUrl.playbackUrl ||
                            video.videoUrl.secureUrl
                          ).substring(0, 30) + "..."}
                        </span>
                      </td>
                      <td className="p-3 flex gap-3">
                        <button
                          onClick={() => handlePlayVideo(video)}
                          className="text-green-600 dark:text-green-500 hover:text-green-800 dark:hover:text-green-400 transition-colors disabled:opacity-50"
                          aria-label={`Play ${video.videoName}`}
                          title="Play video"
                          disabled={isLoading || video.processing}
                        >
                          <PiPlay size={20} aria-hidden="true" />
                        </button>
                        <button
                          onClick={() =>
                            handleCopyUrl(
                              video.videoUrl.signedUrl ||
                                video.videoUrl.playbackUrl ||
                                video.videoUrl.secureUrl
                            )
                          }
                          className="text-orange-600 dark:text-orange-500 hover:text-orange-800 dark:hover:text-orange-400 transition-colors"
                          aria-label={`Copy URL for ${video.videoName}`}
                          title="Copy URL"
                          disabled={isLoading}
                        >
                          <PiClipboard size={20} aria-hidden="true" />
                        </button>
                        <button
                          onClick={() => handleDeleteVideo(video._id)}
                          className="text-red-600 dark:text-red-500 hover:text-red-800 dark:hover:text-red-400 transition-colors disabled:opacity-50"
                          aria-label={`Delete ${video.videoName}`}
                          title="Delete video"
                          disabled={isLoading}
                        >
                          <PiX size={20} aria-hidden="true" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-between items-center mt-4">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="bg-orange-600 dark:bg-orange-700 text-white dark:text-orange-100 py-2 px-4 rounded hover:bg-orange-700 dark:hover:bg-orange-600 transition-colors disabled:opacity-50"
                    disabled={page === 1 || isLoading}
                    aria-label="Previous page"
                  >
                    Previous
                  </button>
                  <span className="text-stone-700 dark:text-stone-300">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className="bg-orange-600 dark:bg-orange-700 text-white dark:text-orange-100 py-2 px-4 rounded hover:bg-orange-700 dark:hover:bg-orange-600 transition-colors disabled:opacity-50"
                    disabled={page === totalPages || isLoading}
                    aria-label="Next page"
                  >
                    Next
                  </button>
                </div>
              )}

              {/* Empty states */}
              {!isLoading && uploadedVideos.length === 0 && (
                <div
                  className="text-center py-8"
                  aria-live="polite"
                >
                  <RiVideoAddLine
                    className="mx-auto text-4xl text-stone-400 dark:text-stone-600 mb-2"
                    aria-hidden="true"
                  />
                  <p className="text-stone-500 dark:text-stone-400">
                    No videos uploaded yet.
                  </p>
                  <button
                    onClick={() => setShowUploadForm(true)}
                    className="mt-4 bg-orange-600 dark:bg-orange-700 text-white dark:text-orange-100 py-2 px-4 rounded hover:bg-orange-700 dark:hover:bg-orange-600 transition-colors"
                    aria-label="Upload your first video"
                  >
                    Upload Your First Video
                  </button>
                </div>
              )}
              {!isLoading &&
                uploadedVideos.length > 0 &&
                filteredVideos.length === 0 && (
                  <div
                    className="text-center py-8"
                    aria-live="polite"
                  >
                    <p className="text-stone-500 dark:text-stone-400">
                      No videos match your search.
                    </p>
                  </div>
                )}
            </div>
          )}
        </section>

        {/* Upload form modal */}
        {showUploadForm && (
          <FocusTrap>
            <div
              className="fixed inset-0 bg-stone-900/90 dark:bg-stone-950/90 flex items-center justify-center min-h-screen z-50 p-4 backdrop-blur-sm"
              role="dialog"
              aria-modal="true"
              aria-labelledby="upload-modal-title"
            >
              <div className="bg-stone-50 dark:bg-stone-900 rounded-xl shadow-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-stone-200 dark:border-stone-700">
                <button
                  onClick={() => {
                    setShowUploadForm(false);
                    setVideo(null);
                    setVideoPreview(null);
                    setVideoName("");
                    setVideoType("module");
                    setError(null);
                  }}
                  className="absolute top-4 right-4 text-orange-600 dark:text-orange-500 hover:text-orange-800 dark:hover:text-orange-400 transition-colors"
                  disabled={isLoading}
                  aria-label="Close upload modal"
                >
                  <PiX size={24} aria-hidden="true" />
                </button>

                <h2
                  id="upload-modal-title"
                  className="text-2xl font-bold text-orange-600 dark:text-orange-500 mb-6"
                >
                  Upload Video
                </h2>

                <form
                  onSubmit={handleUpload}
                  className="space-y-6"
                >
                  <div className="space-y-4">
                    {/* Video name input */}
                    <div className="flex flex-col">
                      <label
                        htmlFor="video-name"
                        className="text-orange-600 dark:text-orange-500 font-bold mb-2"
                      >
                        Video Name
                      </label>
                      <input
                        id="video-name"
                        type="text"
                        value={videoName}
                        onChange={(e) => setVideoName(e.target.value.trim())}
                        className="border-2 border-orange-600 dark:border-orange-500 p-2 rounded focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                        placeholder="Enter a name for your video"
                        required
                        aria-required="true"
                        maxLength={255}
                      />
                    </div>

                    {/* Video type select */}
                    <div className="flex flex-col">
                      <label
                        htmlFor="video-type"
                        className="text-orange-600 dark:text-orange-500 font-bold mb-2"
                      >
                        Video Type
                      </label>
                      <select
                        id="video-type"
                        value={videoType}
                        onChange={(e) =>
                          setVideoType(e.target.value as "module" | "promo")
                        }
                        className="border-2 border-orange-600 dark:border-orange-500 p-2 rounded focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                        required
                        aria-required="true"
                      >
                        <option value="module">Module (Public)</option>
                        <option value="promo">Promo (Premium)</option>
                      </select>
                    </div>

                    {/* File upload area */}
                    <div className="flex flex-col">
                      <label
                        htmlFor="video-upload"
                        className="text-orange-600 dark:text-orange-500 font-bold mb-2"
                      >
                        Select Video
                      </label>
                      <input
                        id="video-upload"
                        onChange={onVideoChange}
                        type="file"
                        ref={pickerRef}
                        accept="video/mp4,video/webm,video/quicktime"
                        className="hidden"
                        disabled={isLoading}
                        aria-describedby="video-upload-help"
                      />
                      <div
                        ref={dropZoneRef}
                        onClick={handlePickVideo}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`w-full flex flex-col h-40 items-center border-2 rounded border-orange-600 dark:border-orange-500 justify-center transition-colors ${
                          isDragging
                            ? "bg-orange-100 dark:bg-stone-800"
                            : "bg-white dark:bg-stone-800"
                        } cursor-pointer`}
                        tabIndex={0}
                        role="button"
                        aria-label="Video upload drop zone"
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            handlePickVideo();
                          }
                        }}
                      >
                        <RiVideoAddLine
                          className="text-orange-600 dark:text-orange-500 text-5xl opacity-50 mb-2"
                          aria-hidden="true"
                        />
                        <span className="text-sm text-stone-500 dark:text-stone-400">
                          {isDragging
                            ? "Drop your video here"
                            : "Click or drag and drop video"}
                        </span>
                        <span
                          id="video-upload-help"
                          className="text-xs text-stone-400 dark:text-stone-500 mt-1"
                        >
                          Supported formats: MP4, WebM, MOV (max 100MB)
                        </span>
                      </div>
                    </div>

                    {/* Video preview */}
                    <div className="flex flex-col">
                      <h3 className="text-orange-600 dark:text-orange-500 font-bold mb-2">
                        Preview
                      </h3>
                      {videoPreview ? (
                        <div className="relative">
                          <video
                            src={videoPreview}
                            className="w-full max-h-60 rounded bg-black"
                            controls
                            controlsList="nodownload"
                            disablePictureInPicture
                            disableRemotePlayback
                            aria-label="Video preview"
                          >
                            <track
                              kind="captions"
                              src=""
                              srcLang="en"
                              label="English"
                              default
                            />
                            Your browser does not support the video tag.
                          </video>
                          <button
                            onClick={handleRemoveVideo}
                            type="button"
                            className="absolute top-2 right-2 bg-red-500 h-8 w-8 flex items-center justify-center rounded-full cursor-pointer text-white"
                            disabled={isLoading}
                            aria-label="Remove selected video"
                          >
                            <PiX size={16} aria-hidden="true" />
                          </button>
                        </div>
                      ) : (
                        <p className="text-stone-500 dark:text-stone-400 text-center py-4">
                          No video selected
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Submit button */}
                  <button
                    type="submit"
                    className="w-full bg-orange-600 dark:bg-orange-700 text-white dark:text-orange-100 py-3 rounded hover:bg-orange-700 dark:hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isLoading || !video || !videoName.trim() || !videoType}
                    aria-busy={isLoading}
                  >
                    {isLoading ? "Uploading..." : "Upload Video"}
                  </button>
                </form>
              </div>
            </div>
          </FocusTrap>
        )}

        {/* Play video modal */}
        {showPlayModal && selectedVideo && (
          <FocusTrap>
            <div
              className="fixed inset-0 bg-stone-900/90 dark:bg-stone-950/90 flex items-center justify-center min-h-screen z-50 p-4 backdrop-blur-sm"
              role="dialog"
              aria-modal="true"
              aria-labelledby="play-modal-title"
            >
              <div className="bg-stone-50 dark:bg-stone-900 rounded-xl shadow-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-stone-200 dark:border-stone-700">
                <button
                  onClick={handleClosePlayModal}
                  className="absolute top-4 right-4 text-orange-600 dark:text-orange-500 hover:text-orange-800 dark:hover:text-orange-400 transition-colors"
                  disabled={isLoading}
                  aria-label="Close video player"
                >
                  <PiX size={24} aria-hidden="true" />
                </button>

                <h2
                  id="play-modal-title"
                  className="text-2xl font-bold text-orange-600 dark:text-orange-500 mb-6"
                >
                  Playing: {selectedVideo.videoName}
                </h2>

                <div className="flex justify-center">
                  <CldVideoPlayer
                    id={`video-player-${selectedVideo._id}`}
                    width={selectedVideo.width || 1920}
                    height={selectedVideo.height || 1080}
                    src={
                      selectedVideo.isPremium
                        ? selectedVideo.videoUrl.signedUrl ||
                          selectedVideo.publicId
                        : selectedVideo.publicId
                    }
                    className="w-full max-h-[70vh] rounded bg-black"
                    autoPlay
                    controls
                    fluid
                    bigPlayButton
                    pictureInPictureToggle={false}
                    playbackRates={[0.5, 1, 1.5, 2]}
                    sourceTypes={["hls", "mp4", "webm"]}
                    transformation={{ quality: "auto" }}
                    videoAttributes={{
                      "aria-label": `Playing ${selectedVideo.videoName}`,
                      disablePictureInPicture: true,
                    }}
                    onContextMenu={(e: React.MouseEvent) => e.preventDefault()}
                    analytics={{ events: ["play", "pause", "ended"] }}
                    colors={{
                      accent: "#f97316",
                      base: "#1f2937",
                      text: "#ffffff",
                    }}
                    fontFace="Inter"
                    logo={{
                      imageUrl: "/logo.png",
                      onClick: () =>
                        window.open("https://your-site.com", "_blank"),
                    }}
                    onError={(e: any) =>
                      console.error("Video player error:", e)
                    }
                  />
                </div>
              </div>
            </div>
          </FocusTrap>
        )}
      </main>
    </>
  );
}