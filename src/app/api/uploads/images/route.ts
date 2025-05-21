import { NextRequest, NextResponse } from "next/server";
import { fetchAllImages, uploadSingleImage } from "@/lib/images";
import Image from "@/models/image.model";

export const config = {
  api: {
    bodyParser: false,
  },
};

// GET: Fetch images based on role and admin ID
export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const adminId = req.headers.get("id");
    const role = req.headers.get("role");
    

    if (!adminId || !role) {
      return NextResponse.json(
        { message: "Authentication required: Missing id or role" },
        { status: 401 }
      );
    }

    let allImages;
    if (role === "super_instructor") {
      // Fetch all images for super_instructor
      allImages = await Image.find().select(
        "_id imageName imageUrl imageType imagePublicId"
      );
    } else {
      // Fetch images created by the admin
      allImages = await Image.find({ uploadedBy: adminId }).select(
        "_id imageName imageUrl imageType imagePublicId"
      );
    }

    // Map images to match ImageData interface
    const imagesFiles = allImages.map((img) => ({
      fileId: img._id.toString(),
      name: img.imageName,
      url: img.imageUrl,
      filePath: img.imageUrl, // Assuming filePath is same as imageUrl; adjust if different
      imageType: img.imageType,
    }));

    return NextResponse.json(
      { message: "Images Fetched Successfully", imagesFiles },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in GET /api/images:", error);
    return NextResponse.json(
      { message: "Internal Server Error", error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

// POST: Receive and upload images
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const adminId = req.headers.get("id");
    console.log(req)
    console.log(adminId)
    if (!adminId) {
      return NextResponse.json(
        { success: false, message: "Authentication required: Missing admin ID" },
        { status: 401 }
      );
    }

    // Parse the multipart/form-data
    const formData = await req.formData();
    const files = formData.getAll("images") as File[];
    const imageName = formData.get("imageName") as string;
    const imageType = formData.get("imageType") as string;

    // Validate inputs
    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, message: "No files were uploaded" },
        { status: 400 }
      );
    }
    if (!imageName) {
      return NextResponse.json(
        { success: false, message: "Image name is required" },
        { status: 400 }
      );
    }
    if (!imageType || !['thumbnail', 'avatar', 'documents', 'banner', 'profile'].includes(imageType)) {
      return NextResponse.json(
        { success: false, message: "Invalid image type" },
        { status: 400 }
      );
    }

    // Upload images and save to database
    const uploadedImages = await Promise.all(
      files.map(async (file) => {
        if (!(file instanceof File)) {
          throw new Error(`Invalid file object: ${file}`);
        }
        const singleUpload = await uploadSingleImage(file);
        const createdImage = await Image.create({
          uploadedBy: adminId,
          imageUrl: singleUpload.thumbnailUrl,
          imagePublicId: singleUpload.fileId,
          imageName,
          imageType,
        });
        return {
          fileId: createdImage._id.toString(),
          name: createdImage.imageName,
          url: createdImage.imageUrl,
          filePath: createdImage.imageUrl, // Adjust if filePath is different
          imageType: createdImage.imageType,
        };
      })
    );

    return NextResponse.json(
      {
        success: true,
        message: "Images received and processed successfully",
        imagesFiles: uploadedImages,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in POST /api/images:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}