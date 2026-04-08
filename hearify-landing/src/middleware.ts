import { NextResponse } from 'next/server';

import type { NextRequest } from 'next/server';

// eslint-disable-next-line import/prefer-default-export
export function middleware(request: NextRequest) {
  const host = request.headers.get('host') || '';
  const subdomain = host.split('.')[0];
  const { pathname } = request.nextUrl;

  const subdomainLocaleMap: Record<string, string> = {
    ua: 'uk',
    ca: 'en-CA',
    au: 'en-AU',
    uk: 'en-GB',
  };

  const localeFromSubdomain = subdomainLocaleMap[subdomain];

  if (pathname.includes('/static') || pathname.includes('/favicon.ico')) {
    return NextResponse.next();
  }

  const { href } = request.nextUrl;
  const hrefChunks = href.split('/');
  const pathnameLocale = hrefChunks[hrefChunks.length - 1];

  if (pathnameLocale === 'uk') {
    return NextResponse.redirect('https://ua.hearify.org');
  }

  if (pathnameLocale === 'en-CA') {
    return NextResponse.redirect('https://ca.hearify.org');
  }

  if (pathnameLocale === 'en-AU') {
    return NextResponse.redirect('https://au.hearify.org');
  }

  if (pathnameLocale === 'en-GB') {
    return NextResponse.redirect('https://au.hearify.org');
  }

  const locale = localeFromSubdomain || 'en';
  const url = request.nextUrl.clone();
  url.locale = locale;

  return NextResponse.rewrite(url);
}
