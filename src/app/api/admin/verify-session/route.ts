import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import Admin from '@/models/admin.model';
import { initializeDatabase } from '@/lib/initDb';

interface AccessTokenPayload {
  id: string;
  role: string;
  iat?: number;
  exp?: number;
}

const ALLOWED_ROLES = ['instructor', 'super_instructor'];

export async function GET(req: NextRequest) {
  try {
    // Get token from headers or cookies
    const authHeader = req.headers.get("Authorization");
    const accessTokenFromCookie = req.cookies.get("accessToken")?.value;
    const accessToken =
    accessTokenFromCookie ||
      (authHeader?.startsWith("Bearer ") ? authHeader.replace("Bearer ", "") : null);

    if (!accessToken) {
      return NextResponse.json(
        { success: false, error: "No refresh token provided" },
        { status: 401 }
      );
    }

    // Validate environment variable
    const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
    if (!accessTokenSecret) {
      console.error('ACCESS_TOKEN_SECRET is not defined');
      return NextResponse.json(
        { isValid: false, error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Verify token
    const decoded = jwt.verify(accessToken, accessTokenSecret) as AccessTokenPayload;
    if (!decoded.id || !decoded.role) {
      return NextResponse.json(
        { isValid: false, error: 'Invalid token payload' },
        { status: 401 }
      );
    }
    // Validate role
    if (!ALLOWED_ROLES.includes(decoded.role)) {
      return NextResponse.json(
        { isValid: false, error: 'Invalid role' },
        { status: 403 }
      );
    }

    // Connect to database
    try {
      await initializeDatabase();
    } catch (dbError) {
      console.error('Database connection error:', {
        message: dbError instanceof Error ? dbError.message : String(dbError),
        timestamp: new Date().toISOString(),
      });
      return NextResponse.json(
        { isValid: false, error: 'Database connection failed' },
        { status: 503 }
      );
    }

    // Find admin
    const admin = await Admin.findOne(
      { _id: decoded.id, role: decoded.role },
      { username: 1, role: 1, status: 1 }
    ).lean();

    if (!admin) {
      return NextResponse.json(
        { isValid: false, error: 'Admin not found' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      isValid: true,
      admin,
    });
  } catch (error) {
    console.error('Session verification error:', {
      message: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
    });

    if (error instanceof jwt.TokenExpiredError) {
      return NextResponse.json(
        { isValid: false, isExpired: true, error: 'Session expired' },
        { status: 401 }
      );
    }

    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json(
        { isValid: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { isValid: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}