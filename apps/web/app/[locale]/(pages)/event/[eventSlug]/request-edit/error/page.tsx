import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { getDictionary } from '@/lib/i18n/get-dictionary';
import { isLocale } from '@/lib/i18n/locales';
import { withLocalePath } from '@/lib/i18n/routing';

type RequestEditErrorPageProps = {
  params: Promise<{ locale: string; eventSlug: string }>;
};

export async function generateMetadata({ params }: RequestEditErrorPageProps): Promise<Metadata> {
  const { locale } = await params;

  if (!isLocale(locale)) {
    return {};
  }

  const dictionary = getDictionary(locale);

  return {
    title: dictionary.event.requestEditError.pageTitle,
  };
}

export default async function RequestEditErrorPage({ params }: RequestEditErrorPageProps) {
  const { locale, eventSlug } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const dictionary = getDictionary(locale);

  return (
    <>
      <h1 className="page-header-title">{dictionary.event.requestEditError.pageTitle}</h1>
      <p style={{ fontSize: '1.1rem', color: '#b91c1c' }}>{dictionary.event.requestEditError.description}</p>
      <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
        <Link href={withLocalePath(locale, `/event/${eventSlug}`)} className="landing-card-link">
          {dictionary.event.requestEditError.backToEvent}
        </Link>
        <Link href={withLocalePath(locale, '/')} className="landing-card-link">
          {dictionary.common.backToHome}
        </Link>
      </div>
    </>
  );
}
