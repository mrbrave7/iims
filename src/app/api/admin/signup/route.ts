import { NextRequest, NextResponse } from 'next/server';
import Admin, { IAdmin } from '@/models/admin.model';
import mongoose from 'mongoose';
import { initializeDatabase } from '@/lib/initDb';

// Define the expected request body type with stricter validation
interface SignupRequestBody {
  email?: string;
  phone?: string;
  signedUpWith: 'email' | 'phone';
  password: string;
  username: string;
}

// Utility function to validate request body
const validateSignupBody = (body: Partial<SignupRequestBody>): string | null => {
  const { signedUpWith, password, username, email, phone } = body;

  if (!signedUpWith || !password || !username) {
    return 'Password, username, and signedUpWith are required';
  }

  if (!['email', 'phone'].includes(signedUpWith)) {
    return 'signedUpWith must be either "email" or "phone"';
  }

  if (signedUpWith === 'phone' && (!phone || typeof phone !== 'string')) {
    return 'Valid phone number is required when signing up with phone';
  }

  if (signedUpWith === 'email' && (!email || typeof email !== 'string')) {
    return 'Valid email is required when signing up with email';
  }

  if (typeof password !== 'string' || password.length < 8) {
    return 'Password must be a string with at least 8 characters';
  }

  if (typeof username !== 'string' || username.length < 4 || username.length > 25) {
    return 'Username must be a string between 4 and 25 characters';
  }

  return null;
};

// POST handler for admin signup
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // Ensure request body exists
    let body: SignupRequestBody;
    try {
      body = await req.json();
      console.log(body)
    } catch (parseError) {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    // Validate request body
    const validationError = validateSignupBody(body);
    if (validationError) {
      return NextResponse.json(
        { success: false, error: validationError },
        { status: 400 }
      );
    }

    const { email, phone, signedUpWith, password, username } = body;

    await initializeDatabase()

    // Check for existing admin with optimized query
    const query: Partial<IAdmin> = { username };
    if (signedUpWith === 'email') query.email = email;
    if (signedUpWith === 'phone') query.phone = phone;

    const existingAdmin = await Admin.findOne(query).lean();
    if (existingAdmin) {
      let conflictField = 'username';
      if (signedUpWith === 'email' && existingAdmin.email === email) conflictField = 'email';
      if (signedUpWith === 'phone' && existingAdmin.phone === phone) conflictField = 'phone';

      return NextResponse.json(
        {
          success: false,
          error: `Admin with this ${conflictField} already exists`,
        },
        { status: 409 }
      );
    }

    // Create new admin
    const newAdmin = new Admin({
      email: signedUpWith === 'email' ? email : undefined,
      phone: signedUpWith === 'phone' ? phone : undefined,
      password,
      username,
    });

    // Save admin with error handling
    await newAdmin.save().catch((error) => {
      if (error.name === 'ValidationError') {
        throw new Error(`Validation failed: ${error.message}`);
      }
      throw error;
    });

    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: 'Admin created successfully',
        data: {
          username: newAdmin.username,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    // Comprehensive error handling
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Signup error:', {
      message: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    });

    // Handle specific Mongoose errors
    if (error instanceof mongoose.Error) {
      if (error.name === 'MongoServerError' && (error as any).code === 11000) {
        return NextResponse.json(
          { success: false, error: 'Duplicate entry detected' },
          { status: 409 }
        );
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Internal Server Error',
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}

// Export config for Next.js API route
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb', // Prevent large payload attacks
    },
  },
};