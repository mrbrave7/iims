import { initializeDatabase } from "@/lib/initDb";
import Admin, { IAdmin } from "@/models/admin.model";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

interface Decoded_Token {
  id: string;
  role: string;
  lat: number;
  exp: string;
}

const ACCESS_TOKEN_EXPIRY = 60 * 60; // 1 hour
const REFRESH_TOKEN_EXPIRY = 7 * 24 * 60 * 60; // 7 days

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const authHeader = req.headers.get("Authorization");
    const refreshTokenFromCookie = req.cookies.get("refreshToken")?.value;
    const refreshToken =
      (authHeader?.startsWith("Bearer ") ? authHeader.replace("Bearer ", "") : null) ||
      refreshTokenFromCookie;

    if (!refreshToken) {
      return NextResponse.json(
        { success: false, error: "No refresh token provided" },
        { status: 401 }
      );
    }

    try {
      await initializeDatabase();
    } catch (error) {
      console.error("Database connection error:", error);
      return NextResponse.json(
        { success: false, error: "Database connection failed" },
        { status: 500 }
      );
    }

    console.log("refresh token : ", refreshToken); // Avoid in production
    let decoded: Decoded_Token | any;
    try {
      if (!process.env.refresh_token_secret) {
        throw new Error("Missing refresh_token_secret environment variable");
      }
      decoded = jwt.verify(refreshToken, process.env.refresh_token_secret);
      console.log("decoded refresh token : ", decoded);
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        console.error("Refresh token expired at:", error.expiredAt);
        return NextResponse.json(
          { success: false, error: "Refresh token expired" },
          { status: 401 }
        );
      }
      if (error instanceof jwt.JsonWebTokenError) {
        console.error("Invalid refresh token:", error.message);
        return NextResponse.json(
          { success: false, error: "Invalid refresh token" },
          { status: 401 }
        );
      }
      throw error;
    }

    const admin = await Admin.findById(decoded?.id) as IAdmin | null;
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Invalid refresh token" },
        { status: 401 }
      );
    }
    // Optional: Restore refresh token check
    if (admin.refreshToken !== refreshToken) {
      admin.refreshToken = undefined;
      await admin.save();
      return NextResponse.json(
        { success: false, error: "Security violation" },
        { status: 403 }
      );
    }

    const { accessToken, refreshToken: newRefreshToken } = admin.generateTokens();
    if (!accessToken || !newRefreshToken) {
      return NextResponse.json(
        { success: false, error: "Token generation failed" },
        { status: 500 }
      );
    }

    admin.refreshToken = newRefreshToken;
    await admin.save({ validateModifiedOnly: true });

    const response = NextResponse.json(
      {
        success: true,
        message: "Token refreshed successfully",
        id: admin._id,
      },
      { status: 200 }
    );

    response.cookies.set("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: ACCESS_TOKEN_EXPIRY * 1000,
    });
    response.cookies.set("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: REFRESH_TOKEN_EXPIRY * 1000,
    });

    return response;
  } catch (error) {
    console.error("Refresh token error:", error);
    const response = NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );

    response.cookies.set("accessToken", "", { maxAge: 0, path: "/" });
    response.cookies.set("refreshToken", "", { maxAge: 0, path: "/" });
    return response;
  }
}

export const config = {
  api: {
    bodyParser: { sizeLimit: "1mb" },
  },
};