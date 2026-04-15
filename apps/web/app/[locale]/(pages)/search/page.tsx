import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { getDictionary } from '@/lib/i18n/get-dictionary';
import { isLocale } from '@/lib/i18n/locales';
import { withLocalePath } from '@/lib/i18n/routing';

type SearchPageProps = {
  params: Promise<{ locale: string }>;
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

export default async function SearchPage({ params }: SearchPageProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const dictionary = getDictionary(locale);

  return (
    <>
      <h1 className="page-header-title">{dictionary.search.pageTitle}</h1>
      <h2 style={{ fontSize: '2rem', marginBottom: '2rem' }}>{dictionary.search.sectionTitle}</h2>
      <p style={{ fontSize: '1.1rem', color: '#64748b' }}>
        {dictionary.search.emptyMessage}
      </p>
      <Link
        href={withLocalePath(locale, '/')}
        style={{
          display: 'inline-block',
          marginTop: '2rem',
          padding: '0.95rem 1.35rem',
          backgroundColor: '#ec4899',
          color: '#ffffff',
          borderRadius: '0.7rem',
          textDecoration: 'none',
          fontWeight: 700,
        }}
      >
        {dictionary.common.backToHome}
      </Link>
    </>
  );
}
