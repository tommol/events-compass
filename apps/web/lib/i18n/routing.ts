import { defaultLocale, isLocale, type Locale } from './locales';

export function withLocalePath(locale: Locale, pathname: string): string {
  const normalizedPath = normalizePathname(pathname);

  if (normalizedPath === '/') {
    return `/${locale}`;
  }

  return `/${locale}${normalizedPath}`;
}

export function switchLocaleInPath(pathname: string, nextLocale: Locale): string {
  const normalizedPath = normalizePathname(pathname);
  const segments = normalizedPath.split('/').filter(Boolean);

  if (segments.length === 0) {
    return `/${nextLocale}`;
  }

  if (isLocale(segments[0])) {
    segments[0] = nextLocale;
    return `/${segments.join('/')}`;
  }

  return withLocalePath(nextLocale, normalizedPath);
}

export function getPathnameWithoutLocale(pathname: string): string {
  const normalizedPath = normalizePathname(pathname);
  const segments = normalizedPath.split('/').filter(Boolean);

  if (segments.length === 0) {
    return '/';
  }

  if (isLocale(segments[0])) {
    const pathWithoutLocale = segments.slice(1).join('/');
    return pathWithoutLocale ? `/${pathWithoutLocale}` : '/';
  }

  return normalizedPath;
}

export function resolveLocaleFromPath(pathname: string): Locale {
  const normalizedPath = normalizePathname(pathname);
  const firstSegment = normalizedPath.split('/').filter(Boolean)[0];

  if (firstSegment && isLocale(firstSegment)) {
    return firstSegment;
  }

  return defaultLocale;
}

function normalizePathname(pathname: string): string {
  if (!pathname || pathname === '/') {
    return '/';
  }

  return pathname.startsWith('/') ? pathname : `/${pathname}`;
}
