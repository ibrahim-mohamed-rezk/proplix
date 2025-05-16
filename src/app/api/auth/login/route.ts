import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { token, user, remember } = body;
  const response = NextResponse.json({ message: remember });

  // Common cookie options
  const cookieOptions: {
    httpOnly: boolean;
    secure: boolean;
    sameSite: "strict" | "lax" | "none";
    maxAge?: number;
  } = {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
  };

  // Add maxAge only if remember is true
  if (remember) {
    cookieOptions.maxAge = 60 * 60 * 24 * 7; // 7 days
  }

  if (token) {
    response.cookies.set("token", token, cookieOptions);
  }

  if (user) {
    // For the user cookie, we don't need httpOnly
    const userCookieOptions: {
      secure: boolean;
      sameSite: "strict" | "lax" | "none";
      maxAge?: number;
    } = {
      secure: true,
      sameSite: "strict",
    };

    if (remember) {
      userCookieOptions.maxAge = 60 * 60 * 24 * 7; // 7 days
    }

    response.cookies.set("user", user, userCookieOptions);
  }

  return response;
}
