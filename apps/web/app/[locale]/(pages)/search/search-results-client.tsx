'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';

import { searchEvents, type EventViewModel } from '@/lib/api';
import { withLocalePath } from '@/lib/i18n/routing';

type SearchResultsClientProps = {
  locale: string;
  query: string;
  limit: number;
  initialEvents: EventViewModel[];
  initialError: string | null;
  emptyMessage: string;
};

export function SearchResultsClient({
  locale,
  query,
  limit,
  initialEvents,
  initialError,
  emptyMessage,
}: SearchResultsClientProps) {
  const [events, setEvents] = useState<EventViewModel[]>(initialEvents);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialError ? false : initialEvents.length === limit);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState<string | null>(initialError);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const eventIds = useMemo(() => new Set(events.map((event) => event.id)), [events]);
  const backToPath = useMemo(() => {
    if (!query) {
      return withLocalePath(locale, '/search');
    }

    const params = new URLSearchParams({
      q: query,
      limit: String(limit),
    });

    return withLocalePath(locale, `/search?${params.toString()}`);
  }, [limit, locale, query]);

  useEffect(() => {
    if (!query || !hasMore || isLoadingMore) {
      return;
    }

    const node = sentinelRef.current;

    if (!node) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];

        if (!entry?.isIntersecting) {
          return;
        }

        setIsLoadingMore(true);
        setLoadMoreError(null);

        const nextPage = page + 1;

        void searchEvents(query, nextPage, limit).then((result) => {
          if (!result.ok) {
            setLoadMoreError(result.error ?? emptyMessage);
            setIsLoadingMore(false);
            return;
          }

          const newItems = result.data.filter((item) => !eventIds.has(item.id));

          setEvents((prev) => [...prev, ...newItems]);
          setPage(nextPage);
          setHasMore(result.data.length === limit);
          setIsLoadingMore(false);
        });
      },
      {
        rootMargin: '260px 0px',
        threshold: 0,
      },
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [emptyMessage, eventIds, hasMore, isLoadingMore, limit, page, query]);

  if (loadMoreError && events.length === 0) {
    return <p className="search-empty-message search-error">{loadMoreError}</p>;
  }

  if (events.length === 0) {
    return <p className="search-empty-message">{emptyMessage}</p>;
  }

  return (
    <>
      <ul className="search-results-grid" aria-live="polite">
        {events.map((event) => (
          <li key={event.id} className="search-result-card">
            <h3 className="search-result-title">
              <Link
                href={`${withLocalePath(locale, `/event/${event.slug}`)}?backTo=${encodeURIComponent(backToPath)}`}
                className="search-result-link"
              >
                {event.name}
              </Link>
            </h3>
            {event.description ? (
              <p className="search-result-description">{event.description}</p>
            ) : null}
            {(event.city || event.venue || event.country) ? (
              <p className="search-result-location">
                {[event.venue, event.city, event.country].filter(Boolean).join(', ')}
              </p>
            ) : null}
          </li>
        ))}
      </ul>

      {loadMoreError ? <p className="search-load-more-error">{loadMoreError}</p> : null}

      {hasMore ? (
        <div ref={sentinelRef} className="search-load-sentinel" aria-hidden="true">
          {isLoadingMore ? 'Loading more...' : ''}
        </div>
      ) : null}
    </>
  );
}