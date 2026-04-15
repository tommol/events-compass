import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { getDictionary } from '@/lib/i18n/get-dictionary';
import { isLocale } from '@/lib/i18n/locales';
import { withLocalePath } from '@/lib/i18n/routing';

type AddEventPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: AddEventPageProps): Promise<Metadata> {
  const { locale } = await params;

  if (!isLocale(locale)) {
    return {};
  }

  const dictionary = getDictionary(locale);

  return {
    title: dictionary.addEvent.pageTitle,
  };
}

export default async function AddEventPage({ params }: AddEventPageProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const dictionary = getDictionary(locale);

  return (
    <>
      <h1 className="page-header-title">{dictionary.addEvent.pageTitle}</h1>
      <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>{dictionary.addEvent.sectionTitle}</h2>
      <form style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ textAlign: 'left' }}>
          <label htmlFor="event-name" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
            {dictionary.addEvent.eventNameLabel}
          </label>
          <input
            id="event-name"
            type="text"
            placeholder={dictionary.addEvent.eventNamePlaceholder}
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              borderRadius: '0.7rem',
              border: '1px solid rgba(255, 255, 255, 0.35)',
              background: 'rgba(255, 255, 255, 0.18)',
              backdropFilter: 'blur(6px)',
              fontSize: '1rem',
            }}
          />
        </div>
        <div style={{ textAlign: 'left' }}>
          <label htmlFor="event-location" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
            {dictionary.addEvent.locationLabel}
          </label>
          <input
            id="event-location"
            type="text"
            placeholder={dictionary.addEvent.locationPlaceholder}
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              borderRadius: '0.7rem',
              border: '1px solid rgba(255, 255, 255, 0.35)',
              background: 'rgba(255, 255, 255, 0.18)',
              backdropFilter: 'blur(6px)',
              fontSize: '1rem',
            }}
          />
        </div>
        <button
          type="submit"
          style={{
            padding: '1rem 2rem',
            background: 'linear-gradient(180deg, #f472b6 0%, #ec4899 50%, #db2777 100%)',
            color: '#ffffff',
            border: 'none',
            borderRadius: '0.8rem',
            fontWeight: 700,
            fontSize: '1.1rem',
            cursor: 'pointer',
          }}
        >
          {dictionary.addEvent.submit}
        </button>
      </form>
      <Link
        href={withLocalePath(locale, '/')}
        style={{
          display: 'inline-block',
          marginTop: '2rem',
          color: '#ec4899',
          textDecoration: 'none',
          fontWeight: 600,
        }}
      >
        {dictionary.common.backToHome}
      </Link>
    </>
  );
}
