import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;

  // If no token, redirect to root login
  if (!token) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  try {
    // Verify token
    jwt.verify(token, process.env.JWT_SECRET!);
    return NextResponse.next();
  } catch {
    // Invalid token = redirect to login
    return NextResponse.redirect(new URL("/", req.url));
  }
}

export const config = {
  matcher: ["/dashboard/:path*"], // Protect everything under /dashboard
};
