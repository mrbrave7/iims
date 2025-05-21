
import { initializeDatabase } from "@/lib/initDb";
import Admin from "@/models/admin.model";
import { NextRequest, NextResponse } from "next/server";

interface LoginRequestBody {
  username: string;
  password: string;
}

const ACCESS_TOKEN_EXPIRY = 60 * 60; // 15 minutes
const REFRESH_TOKEN_EXPIRY = 7 * 24 * 60 * 60; // 7 days

const validateLoginBody = (body: unknown): string | null => {
  if (!body || typeof body !== 'object') return "Invalid request body";
  const { username, password } = body as LoginRequestBody;

  if (!username || typeof username !== "string" || username.length < 4) {
    return "Valid username (minimum 4 characters) is required";
  }
  if (!password || typeof password !== "string" || password.length < 8) {
    return "Valid password (minimum 8 characters) is required";
  }
  return null;
};

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const rawBody = await req.json() as unknown;
    const validationError = validateLoginBody(rawBody);
    if (validationError) {
      return NextResponse.json(
        { success: false, error: validationError, type: "validation_error" },
        { status: 400 }
      );
    }

    const { username, password } = rawBody as LoginRequestBody;

    try {
      await initializeDatabase();
    } catch (dbError) {
      return NextResponse.json(
        { success: false, error: "Database connection failed" },
        { status: 503 }
      );
    }

    const existingAdmin = await Admin.findOne({ username }).select("+password");
    if (!existingAdmin) {
      return NextResponse.json(
        { success: false, error: "No admin found with this username", type: "not_available" },
        { status: 404 }
      );
    }


    const isPasswordCorrect = await existingAdmin.comparePassword(password);
    console.log(isPasswordCorrect)
    if (!isPasswordCorrect) {
      return NextResponse.json(
        { success: false, error: "Incorrect password", type: "incorrect_password" },
        { status: 401 }
      );
    }

    const VALID_STATUSES = 'working'
    if (VALID_STATUSES !== existingAdmin.status) {
      return NextResponse.json(
        {
          success: false,
          error: `Account is ${existingAdmin.status}. Contact support for assistance.`,
          type: "unavailable_admin",
          username,
        },
        { status: 403 }
      );
    }
    const { accessToken, refreshToken } = existingAdmin.generateTokens()
    existingAdmin.refreshToken = refreshToken
    await existingAdmin.save()

    const response = NextResponse.json({
      message: "User LoggedIn Successfully",
      success: true,
      id:existingAdmin._id,

    })
    response.cookies.set('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: ACCESS_TOKEN_EXPIRY * 1000,
    });
    response.cookies.set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: REFRESH_TOKEN_EXPIRY * 1000,
    });

    return response
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    console.error("Login error:", {
      message: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(
      { success: false, error: "Internal Server Error", details: errorMessage },
      { status: 500 }
    );
  }
}

export const config = {
  api: {
    bodyParser: { sizeLimit: "1mb" },
  },
};