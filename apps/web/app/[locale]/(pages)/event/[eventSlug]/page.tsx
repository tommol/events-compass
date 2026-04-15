import type { Metadata } from 'next';
import { CalendarDays, MapPin } from 'lucide-react';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';

import { getEventBySlug, requestEditToken } from '@/lib/api';
import { getDictionary } from '@/lib/i18n/get-dictionary';
import { isLocale } from '@/lib/i18n/locales';
import { withLocalePath } from '@/lib/i18n/routing';

import { RequestEditModal } from './request-edit-modal';

type EventPageProps = {
  params: Promise<{ locale: string; eventSlug: string }>;
  searchParams: Promise<{ updated?: string; backTo?: string }>;
};

export async function generateMetadata({ params }: EventPageProps): Promise<Metadata> {
  const { locale, eventSlug } = await params;

  if (!isLocale(locale)) {
    return {};
  }

  const dictionary = getDictionary(locale);
  const eventResult = await getEventBySlug(eventSlug);

  return {
    title: eventResult.ok ? eventResult.data.name : dictionary.event.pageTitle,
  };
}

export default async function EventPage({ params, searchParams }: EventPageProps) {
  const { locale, eventSlug } = await params;
  const { updated, backTo } = await searchParams;

  if (!isLocale(locale)) {
    notFound();
  }

  const localeCode = locale;
  const dictionary = getDictionary(localeCode);
  const eventResult = await getEventBySlug(eventSlug);

  if (!eventResult.ok) {
    notFound();
  }

  const event = eventResult.data;

  async function handleRequestEditToken(formData: FormData) {
    'use server';

    const email = formData.get('email');

    if (typeof email !== 'string' || !email.trim()) {
      redirect(withLocalePath(localeCode, `/event/${eventSlug}/request-edit/error`));
    }

    const result = await requestEditToken(eventSlug, { email: email.trim() });

    if (result.ok) {
      redirect(withLocalePath(localeCode, `/event/${eventSlug}/request-edit/success`));
    }

    redirect(withLocalePath(localeCode, `/event/${eventSlug}/request-edit/error`));
  }

  const locationParts = [event.venue, event.address, event.city, event.region, event.postalCode, event.country].filter(Boolean);
  const startValue = formatDateTime(event.startAt, localeCode) ?? '-';
  const endValue = formatDateTime(event.endAt, localeCode) ?? '-';
  const locationValue = locationParts.length > 0 ? locationParts.join(', ') : '-';
  const backToSearchHref = getSafeBackToSearchPath(backTo, localeCode);

  return (
    <div className="event-page">
      {/* ── Hero ── */}
      <div className="event-hero">
        <div className="event-hero-inner">
          <p className="event-hero-slug">{event.slug}</p>
          <h1 className="event-hero-title">{event.name}</h1>
          {event.startAt ? (
            <p className="event-hero-date">{formatDateTime(event.startAt, locale)}</p>
          ) : null}
        </div>
      </div>

      {/* ── Updated banner ── */}
      {updated === '1' ? (
        <p
          style={{
            padding: '0.75rem 1rem',
            borderRadius: '0.7rem',
            border: '1px solid #86efac',
            backgroundColor: '#f0fdf4',
            color: '#166534',
            fontWeight: 600,
            margin: 0,
          }}
        >
          {dictionary.event.updateSuccess}
        </p>
      ) : null}

      {/* ── Info card ── */}
      <div className="event-info-card">
        <div className="event-info-grid">
          {/* Start */}
          <div className="event-info-item">
            <span className="event-info-icon">
              <CalendarDays size={18} aria-hidden="true" />
            </span>
            <div>
              <p className="event-info-label">{dictionary.event.fields.startAt}</p>
              <p className="event-info-value">{startValue}</p>
            </div>
          </div>

          {/* End */}
          <div className="event-info-item">
            <span className="event-info-icon">
              <CalendarDays size={18} aria-hidden="true" />
            </span>
            <div>
              <p className="event-info-label">{dictionary.event.fields.endAt}</p>
              <p className="event-info-value">{endValue}</p>
            </div>
          </div>

          {/* Location */}
          <div className="event-info-item">
            <span className="event-info-icon">
              <MapPin size={18} aria-hidden="true" />
            </span>
            <div>
              <p className="event-info-label">{dictionary.event.fields.venue}</p>
              <p className="event-info-value">{locationValue}</p>
            </div>
          </div>
        </div>

        {/* Footer: links + edit button */}
        <div className="event-info-footer">
          <div className="event-info-links">
            {/* Placeholder icon links — extend when API exposes ticketUrl / websiteUrl */}
          </div>
          <RequestEditModal
            action={handleRequestEditToken}
            dictionary={{
              editButton: dictionary.event.editButton,
              requestEditTitle: dictionary.event.requestEditTitle,
              requestEditDescription: dictionary.event.requestEditDescription,
              requestEditEmailLabel: dictionary.event.requestEditEmailLabel,
              requestEditEmailPlaceholder: dictionary.event.requestEditEmailPlaceholder,
              requestEditSubmit: dictionary.event.requestEditSubmit,
            }}
          />
        </div>
      </div>

      {/* ── Description card ── */}
      {event.description ? (
        <div className="event-description-card">
          <h2>{dictionary.event.fields.description}</h2>
          <p>{event.description}</p>
        </div>
      ) : null}

      {backToSearchHref ? (
        <Link
          href={backToSearchHref}
          style={{
            display: 'inline-block',
            color: '#0f766e',
            textDecoration: 'none',
            fontWeight: 600,
          }}
        >
          {dictionary.event.backToSearchResults}
        </Link>
      ) : null}

    </div>
  );
}

function formatDateTime(dateValue: string | undefined, locale: string): string | null {
  if (!dateValue) return null;
  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) return null;
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(parsed);
}

function getSafeBackToSearchPath(backTo: string | undefined, locale: string): string | null {
  if (!backTo) {
    return null;
  }

  if (!backTo.startsWith(`/${locale}/search`)) {
    return null;
  }

  return backTo;
}
