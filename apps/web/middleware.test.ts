/** @jest-environment node */

import type { NextRequest } from 'next/server';

import { middleware } from './middleware';

function createRequest(pathname: string, search = ''): NextRequest {
  return {
    nextUrl: {
      pathname,
      search,
    },
    url: `http://localhost:3000${pathname}${search}`,
  } as unknown as NextRequest;
}

describe('middleware', () => {
  it('redirects root path to English locale', () => {
    const response = middleware(createRequest('/'));

    expect(response.headers.get('location')).toBe('http://localhost:3000/en');
  });

  it('redirects non-localized path to English locale', () => {
    const response = middleware(createRequest('/add-event', '?foo=bar'));

    expect(response.headers.get('location')).toBe('http://localhost:3000/en/add-event?foo=bar');
  });

  it('passes through supported locale paths', () => {
    const response = middleware(createRequest('/pl/subscribe'));

    expect(response.headers.get('x-middleware-next')).toBe('1');
  });

  it('normalizes unsupported locale to default locale', () => {
    const response = middleware(createRequest('/de/search'));

    expect(response.headers.get('location')).toBe('http://localhost:3000/en/search');
  });
});
