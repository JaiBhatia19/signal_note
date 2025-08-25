import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  // Simple middleware that just passes through for now
  // Auth will be handled at the component level
  return NextResponse.next();
}

export const config = { matcher: ["/app/:path*"] }; 