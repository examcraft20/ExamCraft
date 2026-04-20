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

  // IMPORTANT: JWT Refresh Strategy
  // `@supabase/ssr` automatically handles token rotation. When `getUser()` is called,
  // it checks the token's expiry. If it's expired or close to expiring, Supabase automatically
  // issues a new Access Token using the HttpOnly Refresh Token cookie. Our `set` and `remove` 
  // handlers above immediately persist these rotated tokens back to the user's browser, 
  // keeping SSR auth seamless mid-session.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAuthPage = request.nextUrl.pathname.startsWith("/login") || 
                     request.nextUrl.pathname.startsWith("/signup") ||
                     request.nextUrl.pathname.startsWith("/forgot-password") ||
                     request.nextUrl.pathname.startsWith("/reset-password");

  // Public routes that do NOT require authentication
  const isPublicRoute = request.nextUrl.pathname === "/" ||
                        isAuthPage ||
                        request.nextUrl.pathname.startsWith("/invite") ||
                        request.nextUrl.pathname.startsWith("/onboarding");

  // Deny-by-default: everything that isn't public is protected
  const isProtectedRoute = !isPublicRoute;

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
     */
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)",
  ],
};
