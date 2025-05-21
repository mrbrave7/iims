// /api/admin/signout.ts
import { initializeDatabase } from "@/lib/initDb";
import Admin, { IAdmin } from "@/models/admin.model";
import { NextRequest, NextResponse } from "next/server";

// Configuration for the API route
export const config = {
  api: {
    bodyParser: {
      sizeLimit: "1mb",
    },
  },
};

/**
 * Handles POST requests for admin sign-out
 * Clears refresh token from database and cookies
 * @param req - Next.js request object
 * @returns NextResponse with success/failure status
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // Connect to database
    await initializeDatabase();

    // Get cookies from request
    const cookieStore = req.cookies;
    const refreshToken = cookieStore.get("refreshToken")?.value;

    // If no refresh token provided, still clear cookies but don't fail
    if (!refreshToken) {
      const response = NextResponse.json(
        {
          success: true,
          message: "Signed out successfully - no active session found",
        },
        { status: 200 }
      );
      
      // Clear cookies even if no refresh token was provided
      response.cookies.delete("accessToken");
      response.cookies.delete("refreshToken");
      return response;
    }

    // Find admin by refresh token
    const admin = await Admin.findOne({ refreshToken }) as IAdmin | null;
    
    if (admin) {
      // Clear refresh token in database
      admin.refreshToken = undefined;
      await admin.save({ validateModifiedOnly: true });
    }

    // Prepare success response
    const response = NextResponse.json(
      {
        success: true,
        message: "Signed out successfully",
      },
      { status: 200 }
    );

    // Clear authentication cookies
    response.cookies.delete("accessToken");
    response.cookies.delete("refreshToken");

    return response;
  } catch (error) {
    // Handle and log any errors
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    console.error("Logout error:", {
      message: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(
      {
        success: false,
        error: "Internal Server Error",
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}