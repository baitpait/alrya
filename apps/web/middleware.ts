import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session-token";
import { isManagerOnlyPath, isManagerRole } from "@/lib/roles";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isApi = pathname.startsWith("/api/admin");
  const isLogin = pathname === "/admin/login";
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  let session = null;
  if (token) {
    try {
      session = await verifySessionToken(token);
    } catch {
      session = null;
    }
  }

  if (isApi) {
    if (!session) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }
    if (pathname.startsWith("/api/admin/reports") && !isManagerRole(session.roleName)) {
      return NextResponse.json({ error: "صلاحية المدير مطلوبة" }, { status: 403 });
    }
    return NextResponse.next();
  }

  if (!session && !isLogin) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    return NextResponse.redirect(url);
  }

  if (session && isLogin) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    url.search = "";
    return NextResponse.redirect(url);
  }

  if (session && isManagerOnlyPath(pathname) && !isManagerRole(session.roleName)) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/my-assignments";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/api/admin/:path*"],
};
