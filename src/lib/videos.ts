import { v2 as cloudinary, ResourceApiResponse, UploadApiOptions, UploadApiResponse, UploadApiErrorResponse } from "cloudinary";
import { Readable } from "stream";

// Validate environment variables at startup
const requiredEnvVars = [
  "NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME",
  "NEXT_PUBLIC_CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// Interfaces aligned with Cloudinary and MongoDB schema
interface VideoResource {
  public_id: string;
  secure_url: string;
  playback_url?: string;
  duration?: number;
  created_at: string;
  access_mode: "public" | "authenticated";
  type: "upload" | "private";
  format?: string;
  width?: number;
  height?: number;
  processing?: boolean;
}

interface UploadResponse extends UploadApiResponse {
  public_id: string;
  secure_url: string;
  playback_url?: string;
  access_mode: "public" | "authenticated";
  type: "upload" | "private";
  duration?: number;
  format?: string | undefined;
  width?: number | undefined;
  height?: number | undefined;
  processing?: boolean;
}

// Retry logic for transient errors
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
      if (error.http_code && [429, 500, 503].includes(error.http_code)) {
        await new Promise((resolve) => setTimeout(resolve, delayMs * Math.pow(2, i)));
      } else {
        break;
      }
    }
  }
  throw lastError;
}

// Validate publicId format
function validatePublicId(publicId: string): string {
  if (!publicId || typeof publicId !== "string" || !/^[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*$/.test(publicId)) {
    throw new Error(`Invalid publicId: ${publicId}`);
  }
  return publicId;
}

// Validate video file
function validateVideoFile(file: Buffer | Readable | string): void {
  if (!file) {
    throw new Error("File is required");
  }
  if (file instanceof Buffer) {
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.length > maxSize) {
      throw new Error(`File size exceeds 100MB: ${file.length} bytes`);
    }
  }
}

/**
 * Get a single video by publicId
 * @param publicId - The public ID of the video
 * @returns The video resource or null if not found
 */
export async function getSingleVideo(publicId: string): Promise<VideoResource | null> {
  try {
    validatePublicId(publicId);
    const result = await withRetry(() =>
      cloudinary.api.resource(publicId, {
        resource_type: "video",
      })
    );
    return result as VideoResource;
  } catch (error: any) {
    if (error.http_code === 404) {
      console.warn(`Video not found: ${publicId}`);
      return null;
    }
    console.error(`Error fetching video ${publicId}:`, error);
    throw new Error(`Failed to fetch video ${publicId}: ${error.message}`);
  }
}

/**
 * Get all videos from Cloudinary with pagination
 * @param maxResults - Maximum number of results per page (default: 100, max: 500)
 * @param nextCursor - Cursor for pagination (optional)
 * @param fetchAll - Fetch all pages recursively (default: false)
 * @returns Array of video resources and next cursor
 */
export async function getAllVideos(
  maxResults: number = 100,
  nextCursor?: string,
  fetchAll: boolean = false
): Promise<{ videos: VideoResource[]; next_cursor?: string }> {
  try {
    const effectiveMaxResults = Math.min(maxResults, 500); // Cloudinary max
    let allVideos: VideoResource[] = [];
    let currentCursor = nextCursor;

    do {
      const result: ResourceApiResponse = await withRetry(() =>
        cloudinary.api.resources({
          resource_type: "video",
          max_results: effectiveMaxResults,
          next_cursor: currentCursor,
        })
      );

      allVideos = allVideos.concat(result.resources as VideoResource[]);
      currentCursor = result.next_cursor;

      if (!fetchAll || !currentCursor) {
        break;
      }
    } while (currentCursor);

    return {
      videos: allVideos,
      next_cursor: fetchAll ? undefined : currentCursor,
    };
  } catch (error: any) {
    console.error("Error fetching all videos:", error);
    throw new Error(`Failed to fetch videos: ${error.message}`);
  }
}

/**
 * Generate a signed URL for a video
 * @param publicId - The public ID of the video
 * @param options - Configuration for signed URL
 * @returns Signed URL
 */
export function generateSignedVideoUrl(
  publicId: string,
  options: {
    expiresInSeconds?: number;
    type?: "upload" | "private";
    transformations?: any[];
  } = {}
): string {
  const { expiresInSeconds = 3600, type = "private", transformations = [{ quality: "auto" }] } = options;
  validatePublicId(publicId);

  console.debug(`Generating signed URL for ${publicId}, type: ${type}, expires in: ${expiresInSeconds}s`);
  return cloudinary.url(publicId, {
    resource_type: "video",
    secure: true,
    sign_url: true,
    expires_at: Math.floor(Date.now() / 1000) + expiresInSeconds,
    transformation: transformations,
    type,
  });
}

/**
 * Upload a public video to Cloudinary
 * @param file - The video file as a Buffer
 * @param options - Upload options (folder, tags, uploadPreset)
 * @returns The uploaded video resource
 */
export async function uploadPublicVideo(
  file: Buffer,
  options: Partial<UploadApiOptions> = {}
): Promise<UploadResponse> {
  validateVideoFile(file);
  const uploadOptions: UploadApiOptions = {
    resource_type: "video",
    chunk_size: file.length > 50_000_000 ? 20_000_000 : 6_000_000, // Dynamic chunk size
    folder: options.folder || "public_videos",
    access_mode: "public",
    type: "upload",
    tags: options.tags || ["public"],
    upload_preset: options.uploadPreset || "public_video_preset",
    eager: [{ streaming_profile: "hd", format: "m3u8" }], // Generate HLS
    eager_async: true,
    invalidate: true,
    ...options,
  };

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
        if (error) {
          console.error("Error uploading public video:", error);
          reject(new Error(`Upload failed: ${error.message}`));
        } else if (!result) {
          console.error("No result from Cloudinary");
          reject(new Error("No result returned from Cloudinary"));
        } else {
          console.debug(`Uploaded public video: ${result.public_id}`);
          resolve({
            ...result,
            access_mode: result.access_mode || "public",
            type: result.type || "upload",
            processing: result.eager ? true : false,
          } as UploadResponse);
        }
      }
    );
    stream.on("error", (err) => {
      console.error("Stream error during public video upload:", err);
      reject(err);
    });
    stream.end(file);
  });
}

/**
 * Upload a private video to Cloudinary
 * @param file - The video file as a Buffer, Readable stream, or file path
 * @param options - Upload options (folder, tags, uploadPreset, expiresInSeconds, watermarkText)
 * @returns The uploaded video resource
 */
export async function uploadPrivateVideo(
  file: Buffer | Readable | string,
  options: Partial<UploadApiOptions> & {
    expiresInSeconds?: number;
    watermarkText?: string;
  } = {}
): Promise<UploadResponse> {
  validateVideoFile(file);
  const transformations = options.watermarkText
    ? [
        {
          overlay: { font_family: "Arial", font_size: 20, text: options.watermarkText },
          gravity: "south_east",
          opacity: 50,
        },
      ]
    : [];

  const uploadOptions: UploadApiOptions = {
    resource_type: "video",
    chunk_size: Buffer.isBuffer(file) && file.length > 50_000_000 ? 20_000_000 : 6_000_000,
    folder: options.folder || "premium_videos",
    access_mode: "authenticated",
    type: "private",
    tags: options.tags || ["premium"],
    upload_preset: options.uploadPreset || "private_video_preset",
    eager: [{ streaming_profile: "hd", format: "m3u8" }],
    eager_async: true,
    invalidate: true,
    transformation: transformations,
    ...options,
  };

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
        if (error) {
          console.error("Error uploading private video:", error);
          reject(new Error(`Upload failed: ${error.message}`));
        } else if (!result) {
          console.error("No result from Cloudinary");
          reject(new Error("No result returned from Cloudinary"));
        } else {
          console.debug(`Uploaded private video: ${result.public_id}`);
          resolve({
            ...result,
            access_mode: result.access_mode || "authenticated",
            type: result.type || "private",
            processing: result.eager ? true : false,
          } as UploadResponse);
        }
      }
    );
    stream.on("error", (err) => {
      console.error("Stream error during private video upload:", err);
      reject(err);
    });

    if (typeof file === "string") {
      // Handle file path (not recommended for Next.js)
      cloudinary.uploader
        .upload(file, uploadOptions)
        .then((result) =>
          resolve({
            ...result,
            access_mode: result.access_mode || "authenticated",
            type: result.type || "private",
            processing: result.eager ? true : false,
          } as UploadResponse)
        )
        .catch((err) => reject(err));
    } else {
      (file instanceof Readable ? file : Readable.from(file)).pipe(stream);
    }
  });
}

/**
 * Delete a video by Cloudinary
 * @param publicId - The public ID of the video to delete
 * @returns Deletion result
 */
interface DestroyResponse {
  result: "ok" | "not found" | string;
}

export async function deleteVideo(publicId: string): Promise<DestroyResponse> {
  validatePublicId(publicId);
  try {
    console.debug(`Attempting to delete video: ${publicId}`);
    const result = await withRetry(() =>
      cloudinary.uploader.destroy(publicId, {
        resource_type: "video",
      })
    );

    if (result.result === "not found") {
      console.warn(`Video not found: ${publicId}`);
    } else if (result.result === "ok") {
      console.debug(`Successfully deleted video: ${publicId}`);
    } else {
      console.error(`Delete failed for ${publicId}: ${result.result}`);
      throw new Error(`Failed to delete video: ${result.result}`);
    }
    return result;
  } catch (error: any) {
    console.error(`Error deleting video ${publicId}:`, error);
    throw new Error(`Failed to delete video ${publicId}: ${error.message}`);
  }
}