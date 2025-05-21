import { initializeDatabase } from "@/lib/initDb";
import Admin from "@/models/admin.model";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: { params: { id: string } }):Promise<NextResponse> {
  try {
    const { id } =await params; // Correctly destructure from params, not req

    // Check for missing, undefined, or invalid ID
    if (!id || id === "undefined" || typeof id !== "string") {
      return NextResponse.json({ error: "Please provide a valid admin ID" }, { status: 400 });
    }

    await initializeDatabase()

    console.log(id)

    // Fetch admin from the database
    const existingAdmin = await Admin.findById(id);

    if (!existingAdmin) {
      return NextResponse.json({ error: "Admin with this ID doesn't exist" }, { status: 404 });
    }

    // Return success response with typed admin data
    return NextResponse.json(
      { message: "Admin fetched successfully", admin: existingAdmin },
      { status: 200 }
    );
  } catch (error) {
    // Log the error for debugging
    console.error("Error fetching admin:", error);

    // Differentiate error types if possible
    if (error instanceof Error && error.name === "CastError") {
      return NextResponse.json({ error: "Invalid admin ID format" }, { status: 400 });
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}