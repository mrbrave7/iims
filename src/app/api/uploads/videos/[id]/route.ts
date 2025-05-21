import { deleteVideo, uploadPrivateVideo, uploadPublicVideo, generateSignedVideoUrl } from "@/lib/videos";
import Video from "@/models/video.model";
import { Types } from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import { initializeDatabase } from "@/lib/initDb";

// Disable Next.js body parser for formData
export const config = {
  api: {
    bodyParser: false,
  },
};

/**
 * Upload a video (public or private)
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {

    await initializeDatabase()

    const { id } = params; // Admin ID
    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid or unauthorized admin ID" },
        { status: 403 }
      );
    }

    // Parse form data
    const data = await req.formData();
    const file = data.get("video");
    const videoName = data.get("videoName")?.toString().trim();
    const videoType = data.get("videoType")?.toString() as "module" | "promo" | undefined;

    // Validate inputs
    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Video file is required" },
        { status: 400 }
      );
    }
    if (!videoName || videoName.length > 255) {
      return NextResponse.json(
        { error: "Video name is required and must be ≤ 255 characters" },
        { status: 400 }
      );
    }
    if (!["module", "promo"].includes(videoType || "")) {
      return NextResponse.json(
        { error: "Invalid video type: Must be 'module' or 'promo'" },
        { status: 400 }
      );
    }

    // Validate file size and type
    const maxFileSize = 100 * 1024 * 1024; // 100 MB
    if (file.size > maxFileSize) {
      return NextResponse.json(
        { error: "Video file too large: Maximum 100 MB" },
        { status: 413 }
      );
    }
    const allowedTypes = ["video/mp4", "video/webm", "video/mov"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type: Only MP4, WebM, or MOV allowed" },
        { status: 400 }
      );
    }

    // Upload to Cloudinary
    const buffer = Buffer.from(await file.arrayBuffer());
    console.debug(`Uploading video: ${videoName}, size: ${(buffer.length / 1024 / 1024).toFixed(2)} MB, type: ${videoType}`);
    const uploadedVideo = videoType === "promo"
      ? await uploadPrivateVideo(buffer, { watermarkText: "Premium Content" })
      : await uploadPublicVideo(buffer);

    // Validate Cloudinary response
    if (!uploadedVideo?.public_id) {
      return NextResponse.json(
        { error: "Failed to upload video to Cloudinary" },
        { status: 500 }
      );
    }

    // Create video document
    const newVideo = await Video.create({
      uploadedBy: id,
      videoUrl: {
        secureUrl: uploadedVideo.secure_url,
        playbackUrl: uploadedVideo.playback_url ?? null,
      },
      publicId: uploadedVideo.public_id,
      videoType,
      videoName,
      isPremium: videoType === "promo",
      accessMode: uploadedVideo.access_mode,
      type: uploadedVideo.type,
      duration: uploadedVideo.duration ?? null,
      format: uploadedVideo.format ?? null,
      width: uploadedVideo.width ?? null,
      height: uploadedVideo.height ?? null,
      processing: uploadedVideo.processing ?? true,
    });

    return NextResponse.json(
      {
        message: uploadedVideo.processing
          ? "Video uploaded and processing asynchronously"
          : "Video uploaded successfully",
        newVideo: {
          _id: newVideo._id.toString(),
          videoName: newVideo.videoName,
          publicId: newVideo.publicId,
          videoUrl: newVideo.videoUrl,
          videoType: newVideo.videoType,
          isPremium: newVideo.isPremium,
          accessMode: newVideo.accessMode,
          type: newVideo.type,
          duration: newVideo.duration,
          format: newVideo.format,
          width: newVideo.width,
          height: newVideo.height,
          processing: newVideo.processing,
          createdAt: newVideo.createdAt.toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error(`Error uploading video for admin ${params.id}:`, error);
    if (error?.http_code === 400 && error?.message.includes("eager_async=true")) {
      return NextResponse.json(
        { error: "Video too large for synchronous processing" },
        { status: 400 }
      );
    }
    if (error?.http_code === 413) {
      return NextResponse.json(
        { error: "Video file too large for Cloudinary" },
        { status: 413 }
      );
    }
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Invalid request format" },
        { status: 400 }
      );
    }
    if (error.name === "MongoServerError" && error.code === 11000) {
      return NextResponse.json(
        { error: "Video with this publicId already exists" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: `Internal server error: ${error.message}` },
      { status: 500 }
    );
  }
}

/**
 * Retrieve videos with pagination and filtering
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    await initializeDatabase()


    const { id } = params; // Admin ID
    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid admin ID" },
        { status: 400 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get("limit") || "10")));
    const skip = (page - 1) * limit;
    const videoType = searchParams.get("videoType") as "promo" | "module" | null;
    const processing = searchParams.get("processing") === "true" ? true : searchParams.get("processing") === "false" ? false : null;

    // Build query
    const query: any = { uploadedBy: id };
    if (videoType) query.videoType = videoType;
    if (processing !== null) query.processing = processing;

    // Fetch videos
    console.debug(`Fetching videos for admin ${id}, page: ${page}, limit: ${limit}, query: ${JSON.stringify(query)}`);
    const allVideos = await Video.find(query)
      .lean()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Generate signed URLs for premium videos
    const videosWithSignedUrls = allVideos.map((video) => ({
      ...video,
      videoUrl: {
        ...video.videoUrl,
        signedUrl: video.isPremium ? generateSignedVideoUrl(video.publicId, { type: video.type }) : undefined,
      },
    }));

    // Get total count
    const totalVideos = await Video.countDocuments(query);

    return NextResponse.json(
      {
        message: allVideos.length ? "Videos retrieved successfully" : "No videos found",
        allVideos: videosWithSignedUrls,
        pagination: {
          page,
          limit,
          totalVideos,
          totalPages: Math.ceil(totalVideos / limit),
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error(`Error retrieving videos for admin ${params.id}:`, error);
    return NextResponse.json(
      { error: `Internal server error: ${error.message}` },
      { status: 500 }
    );
  }
}

/**
 * Soft delete a video
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    await initializeDatabase()

    const { id } = params; // Video ID
    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid video ID" },
        { status: 400 }
      );
    }

    // Find video and verify ownership
    const video = await Video.findOne({ _id: id, deleted: false});
    if (!video) {
      return NextResponse.json(
        { error: "Video not found or unauthorized" },
        { status: 404 }
      );
    }

    // Soft delete
    await Video.findByIdAndUpdate(id, { deleted: true });
    console.debug(`Soft deleted video ${id}, publicId: ${video.publicId}`);

    // Delete from Cloudinary (optional, with fallback)
    try {
      await deleteVideo(video.publicId);
      console.debug(`Deleted video from Cloudinary: ${video.publicId}`);
    } catch (cloudinaryError) {
      console.warn(`Cloudinary deletion failed for ${video.publicId}, soft delete succeeded`);
    }

    return NextResponse.json(
      { message: "Video deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error(`Error deleting video ${params.id}:`, error);
    return NextResponse.json(
      { error: `Internal server error: ${error.message}` },
      { status: 500 }
    );
  }
}