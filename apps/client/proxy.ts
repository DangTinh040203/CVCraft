import { clerkMiddleware } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export const proxy = clerkMiddleware(async (auth, req) => {
  const { isAuthenticated } = await auth();
  const pathname = req.nextUrl.pathname;

  // The SSO callback must stay reachable while Clerk finishes the sign-in
  if (
    isAuthenticated &&
    pathname.startsWith('/auth') &&
    !pathname.startsWith('/auth/sign-in/sso-callback')
  ) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  if (!isAuthenticated && pathname.startsWith('/builder')) {
    const signInUrl = new URL('/auth/sign-in', req.url);
    signInUrl.searchParams.set(
      'callbackUrl',
      `${pathname}${req.nextUrl.search}`,
    );
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals, metadata routes, static files and /print (opened
    // by the backend's headless Chromium, which has no Clerk session and must
    // not be sent through Clerk's handshake redirect)
    '/((?!_next|print|icon|apple-icon|manifest|sitemap|robots|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
