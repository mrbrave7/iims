import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

interface VerifySessionResponse {
  isValid: boolean;
  data?: unknown;
  isExpired?: boolean;
  error?: string;
}

interface RefreshTokenResponse {
  success: boolean;
  message: string;
  id: string;
}

async function verifySession(request: NextRequest): Promise<VerifySessionResponse> {
  try {
    const verifyUrl = new URL("/api/admin/verify-session", request.nextUrl.origin).toString();
    const accessToken = request.cookies.get("accessToken")?.value;

    if (!accessToken) {
      return { isValid: false, error: "No access token provided", isExpired: false };
    }

    const response = await fetch(verifyUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      credentials: "same-origin",
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        isValid: false,
        error: errorData.message || "Session verification failed",
        isExpired: errorData.message?.includes("expired") || errorData.code === "TOKEN_EXPIRED",
      };
    }
    return { isValid: true, data: await response.json() };
  } catch (error) {
    console.error("Session verification error:", error);
    return { isValid: false, error: "Verification failed", isExpired: false };
  }
}

async function refreshTokens(request: NextRequest): Promise<string | null> {
  try {
    const refreshUrl = new URL("/api/admin/refresh-token", request.nextUrl.origin).toString();
    const refreshToken = request.cookies.get("refreshToken")?.value;

    if (!refreshToken) {
      console.error("No refresh token found in cookies");
      throw new Error("No refresh token provided");
    }

    console.log("Attempting to refresh token with URL:", refreshUrl);
    const response = await fetch(refreshUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${refreshToken}`,
        "Content-Type": "application/json",
      },
      credentials: "same-origin",
    });

    const responseText = await response.text();
    console.log("Refresh token response status:", response.status, "body:", responseText);

    if (!response.ok) {
      let errorData: any = {};
      try {
        errorData = responseText ? JSON.parse(responseText) : {};
      } catch (parseError) {
        console.error("Failed to parse refresh token response:", parseError);
      }

      if (response.status === 401 && errorData.error?.includes("expired")) {
        console.error("Refresh token expired");
        throw new Error("Refresh token expired");
      }
      if (response.status === 401 && errorData.error?.includes("Invalid")) {
        console.error("Invalid refresh token");
        throw new Error("Invalid refresh token");
      }
      throw new Error(`Failed to refresh token: ${response.status} ${responseText}`);
    }

    const data: RefreshTokenResponse = JSON.parse(responseText);
    if (!data.success || !data.id) {
      throw new Error("Invalid refresh token response: missing success or id");
    }

    return data.id;
  } catch (error) {
    console.error("Token refresh error:", error);
    return null;
  }
}

function isPublicRoute(path: string): boolean {
  const publicRoutes = ["/admins/signin", "/admins/signup", /^\/admins\/unverified($|\/.*)/];
  return publicRoutes.some((route) =>
    typeof route === "string" ? path === route : route.test(path)
  );
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Log token presence
  const accessToken = request.cookies.get("accessToken")?.value;
  const refreshToken = request.cookies.get("refreshToken")?.value;
  console.log("Access token present:", !!accessToken, "Refresh token present:", !!refreshToken);

  // 1. Allow public routes
  if (isPublicRoute(path)) {
    if (accessToken) {
      return NextResponse.redirect(new URL("/", request.nextUrl.origin));
    }
    return NextResponse.next();
  }

  // 2. Verify session
  const session = await verifySession(request);
  if (session.isValid) {
    return NextResponse.next();
  }

  // 3. Attempt token refresh if expired
  if (!session.isValid && session.isExpired) {
    console.log("Attempting refresh for path:", path, "session:", session);
    const id = await refreshTokens(request);
    console.log("Refresh token result id:", id);
    if (!id) {
      const response = NextResponse.redirect(new URL("/admins/signin", request.nextUrl));
      response.cookies.set("accessToken", "", { maxAge: 0, path: "/" });
      response.cookies.set("refreshToken", "", { maxAge: 0, path: "/" });
      return response;
    }

    // The endpoint sets cookies, so proceed with the request
    return NextResponse.next();
  }

  // Redirect to signin if session is invalid and not expired
  const response = NextResponse.redirect(new URL("/admins/signin", request.nextUrl));
  response.cookies.set("accessToken", "", { maxAge: 0, path: "/" });
  response.cookies.set("refreshToken", "", { maxAge: 0, path: "/" });
  return response;
}

export const config = {
  matcher: [
    "/((?!api/|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};