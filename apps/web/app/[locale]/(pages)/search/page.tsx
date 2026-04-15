import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { searchEvents } from '@/lib/api';
import { getDictionary } from '@/lib/i18n/get-dictionary';
import { isLocale } from '@/lib/i18n/locales';
import { withLocalePath } from '@/lib/i18n/routing';

import { SearchResultsClient } from './search-results-client';

type SearchPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string; page?: string; limit?: string }>;
};

export async function generateMetadata({ params }: SearchPageProps): Promise<Metadata> {
  const { locale } = await params;

  if (!isLocale(locale)) {
    return {};
  }

  const dictionary = getDictionary(locale);

  return {
    title: dictionary.search.pageTitle,
  };
}

export default async function SearchPage({ params, searchParams }: SearchPageProps) {
  const { locale } = await params;
  const queryValues = await searchParams;

  if (!isLocale(locale)) {
    notFound();
  }

  const dictionary = getDictionary(locale);
  const query = (queryValues.q ?? '').trim();
  const limit = parsePositiveNumber(queryValues.limit, 12);

  const eventsResult = query.length > 0
    ? await searchEvents(query, 1, limit)
    : { ok: true as const, status: 200, data: [] };

  const initialEvents = eventsResult.ok ? eventsResult.data : [];
  const initialError = eventsResult.ok ? null : (eventsResult.error ?? dictionary.search.emptyMessage);

  return (
    <div className="search-page">
      <form
        className="event-search search-page-form"
        role="search"
        aria-label={dictionary.landing.searchAriaLabel}
        action={withLocalePath(locale, '/search')}
        method="get"
      >
        <label htmlFor="search-page-input" className="sr-only">
          {dictionary.landing.searchLabel}
        </label>
        <input
          id="search-page-input"
          name="q"
          type="search"
          defaultValue={query}
          placeholder={dictionary.landing.searchPlaceholder}
          className="event-search-input"
        />
        <button type="submit" className="event-search-button">
          {dictionary.landing.searchButton}
        </button>
      </form>

      <SearchResultsClient
        locale={locale}
        query={query}
        limit={limit}
        initialEvents={initialEvents}
        initialError={initialError}
        emptyMessage={dictionary.search.emptyMessage}
      />
    </div>
  );
}

function parsePositiveNumber(value: string | undefined, fallback: number): number {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed < 1) {
    return fallback;
  }

  return Math.floor(parsed);
}
