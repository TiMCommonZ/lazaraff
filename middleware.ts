import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose'; // Import jwtVerify from jose

interface JwtPayload {
  userId: string;
  userEmail: string;
  userRole: string; // Corresponds to UserRole enum in Prisma
}

export async function middleware(request: NextRequest) {
  // Try to get token from cookies first
  const token = request.cookies.get('token')?.value; // Read token from cookies
  const secret = process.env.JWT_SECRET;

  const protectedAdminRoutes = ['/admin', '/api/admin'];
  const isProtectedRoute = protectedAdminRoutes.some(route => request.nextUrl.pathname.startsWith(route));

  // Redirect to login if no token and trying to access protected routes
  if (!token && isProtectedRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (token && secret) {
    try {
      // Use jwtVerify from jose
      const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
      const decoded: JwtPayload = {
        userId: payload.userId as string,
        userEmail: payload.userEmail as string,
        userRole: payload.userRole as string,
      }; // Explicitly define decoded from payload

      // Attach user info to request headers for API routes to consume
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-id', decoded.userId);
      requestHeaders.set('x-user-email', decoded.userEmail);
      requestHeaders.set('x-user-role', decoded.userRole);

      // Check for admin role if accessing admin routes
      if (isProtectedRoute) {
        if (decoded.userRole !== 'ADMIN') {
          return NextResponse.json({ message: 'Unauthorized: Admin access required' }, { status: 403 });
        }
      }

      return NextResponse.next({ request: { headers: requestHeaders } });
    } catch (error) {
      console.error('JWT Verification Error:', error);
      // Clear invalid token cookie and redirect to login
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('token'); // Clear the invalid token
      return response;
    }
  }

  // Allow the request to proceed if no token is required or if it's not a protected route
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*',
    // Add other protected routes here as needed
    // '/api/users/:path*',
    // '/api/slides/:path*',
    // '/api/products/:path*',
    // '/api/articles/:path*',
    // '/api/article-contents/:path*',
  ],
}; 