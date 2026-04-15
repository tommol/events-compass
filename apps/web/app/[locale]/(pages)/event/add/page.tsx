import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { getDictionary } from '@/lib/i18n/get-dictionary';
import { isLocale } from '@/lib/i18n/locales';
import { withLocalePath } from '@/lib/i18n/routing';

import { AddEventForm } from './add-event-form';

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
      <div className="form-card">
        <h2 className="page-header-title" style={{ marginBottom: '1.75rem' }}>{dictionary.addEvent.sectionTitle}</h2>
        <AddEventForm locale={locale} dictionary={dictionary.addEvent} />
      </div>
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
