import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: "",
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: "",
            ...options,
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAuthPage = request.nextUrl.pathname.startsWith("/login") || 
                     request.nextUrl.pathname.startsWith("/signup") ||
                     request.nextUrl.pathname.startsWith("/forgot-password") ||
                     request.nextUrl.pathname.startsWith("/reset-password");

  // Protected routes are everything EXCEPT auth pages and public routes (like /)
  // For simplicity following the protocol:
  const isProtectedRoute = request.nextUrl.pathname === "/dashboard" ||
                           request.nextUrl.pathname.startsWith("/dashboard/") ||
                           request.nextUrl.pathname.startsWith("/questions") ||
                           request.nextUrl.pathname.startsWith("/papers") ||
                           request.nextUrl.pathname.startsWith("/templates") ||
                           request.nextUrl.pathname.startsWith("/analytics") ||
                           request.nextUrl.pathname.startsWith("/review") ||
                           request.nextUrl.pathname.startsWith("/team") ||
                           request.nextUrl.pathname.startsWith("/settings") ||
                           request.nextUrl.pathname.startsWith("/library") ||
                           request.nextUrl.pathname.startsWith("/profile") ||
                           request.nextUrl.pathname.startsWith("/tenants") ||
                           request.nextUrl.pathname.startsWith("/audit") ||
                           request.nextUrl.pathname.startsWith("/flags");

  // Redirect to login if unauthenticated and trying to access protected route
  if (!user && isProtectedRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Redirect to dashboard if authenticated and trying to access auth page
  if (user && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
