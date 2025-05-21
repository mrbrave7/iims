import { deleteSingleImage } from "@/lib/images";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    // Validate fileId parameter
    const { id } = await params;
    if (!id || typeof id !== "string" || id.trim() === "") {
      return NextResponse.json(
        { error: "fileId parameter is required and must be a non-empty string" },
        { status: 400 }
      );
    }

    // Attempt to delete the image
    await deleteSingleImage(id);

    // Return success response
    return NextResponse.json(
      { success: true, message: "Image deleted successfully" },
      { status: 200 }
    );

  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}