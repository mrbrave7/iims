// src/app/lib/images.ts
import ImageKit from "imagekit";

// Interface for ImageKit configuration
interface ImageKitConfig {
  publicKey: string;
  privateKey: string;
  urlEndpoint: string;
}

// Interface for Image response
interface Image {
  fileId: string;
  name: string;
  url: string;
  thumbnailUrl: string;
  filePath: string;
}

// Initialize ImageKit with configuration
const imagekit = new ImageKit({
  publicKey: process.env.IMAGE_KIT_PUBLIC_KEY || "",
  privateKey: process.env.IMAGE_KIT_PRIVATE_KEY || "",
  urlEndpoint: process.env.IMAGE_KIT_END_POINT_URL || "",
});

// Validate environment variables
if (!process.env.IMAGE_KIT_PUBLIC_KEY || !process.env.IMAGE_KIT_PRIVATE_KEY || !process.env.IMAGE_KIT_END_POINT_URL) {
  throw new Error("ImageKit configuration is incomplete. Check environment variables: IMAGE_KIT_PUBLIC_KEY, IMAGE_KIT_PRIVATE_KEY, IMAGE_KIT_END_POINT_URL");
}

/**
 * Fetches all images from ImageKit
 * @returns Promise<Image[]> - Array of image objects
 */
export async function fetchAllImages(): Promise<Image[]> {
  try {
    const response = await imagekit.listFiles({
      skip: 0,
      limit: 100,
    });
    return response.map((img: any) => ({
      fileId: img.fileId,
      name: img.name,
      url: img.url,
      thumbnailUrl: img.thumbnailUrl,
      filePath: img.filePath,
    }));
  } catch (error) {
    console.error("Error fetching images from ImageKit:", error);
    throw new Error(`Failed to fetch images: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

/**
 * Uploads a single image to ImageKit
 * @param file - The file to upload (File object from browser FormData)
 * @returns Promise<Image> - Uploaded image details
 */
export async function uploadSingleImage(file: File): Promise<Image> {
  try {
    // Convert the browser File object to a Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const response = await imagekit.upload({
      file: buffer, // Use Buffer instead of File object
      fileName: file.name || `image_${Date.now()}`, // Use file.name with fallback
      tags: ["uploaded-image"],
      folder: "/uploads",
    });

    return {
      fileId: response.fileId,
      name: response.name,
      url: response.url,
      thumbnailUrl: response.thumbnailUrl,
      filePath: response.filePath,
    };
  } catch (error) {
    console.error(`Error uploading image ${file.name || "unknown"}:`, error);
    throw new Error(`Failed to upload image: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

/**
 * Deletes a single image from ImageKit
 * @param fileId - The ID of the image to delete
 * @returns Promise<void>
 */
export async function deleteSingleImage(fileId: string): Promise<void> {
  try {
    await imagekit.deleteFile(fileId);
    console.log(`Image ${fileId} deleted successfully`);
  } catch (error) {
    console.error(`Error deleting image ${fileId}:`, error);
    throw new Error(`Failed to delete image: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}