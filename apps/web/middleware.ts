import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { defaultLocale, isLocale } from '@/lib/i18n/locales';

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const segments = pathname.split('/').filter(Boolean);

  if (segments.length === 0) {
    return NextResponse.redirect(new URL(`/${defaultLocale}`, request.url));
  }

  const firstSegment = segments[0];

  if (isLocale(firstSegment)) {
    return NextResponse.next();
  }

  const candidate = firstSegment.toLowerCase();

  if (/^[a-z]{2}$/.test(candidate) && !isLocale(candidate)) {
    const remainingPath = segments.slice(1).join('/');
    const redirectPath = remainingPath ? `/${defaultLocale}/${remainingPath}` : `/${defaultLocale}`;
    return NextResponse.redirect(new URL(`${redirectPath}${search}`, request.url));
  }

  return NextResponse.redirect(new URL(`/${defaultLocale}${pathname}${search}`, request.url));
}

export const config = {
  matcher: ['/((?!api|_next|favicon.ico|.*\\..*).*)'],
};
