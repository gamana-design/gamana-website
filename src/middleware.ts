import { NextRequest, NextResponse } from "next/server";
export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  if (path === "/admin/login" || path === "/api/admin/login") return NextResponse.next();
  if (request.cookies.has("gamana_admin_session")) return NextResponse.next();
  if (path.startsWith("/api/")) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  const login = new URL("/admin/login", request.url); login.searchParams.set("next", path); return NextResponse.redirect(login);
}
export const config = { matcher: ["/admin/:path*", "/api/admin/:path*"] };
