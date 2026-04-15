import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { LanguageSwitcher } from '@/components/language-switcher';
import { getDictionary } from '@/lib/i18n/get-dictionary';
import { isLocale } from '@/lib/i18n/locales';
import { withLocalePath } from '@/lib/i18n/routing';

type HomePageProps = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const dictionary = getDictionary(locale);

  return (
    <main className="landing">
      <LanguageSwitcher locale={locale} dictionary={dictionary} />
      <div className="landing-logo-wrap">
        <div className="landing-logo-bg">
          <Image
            src="/event-compass.png"
            alt={dictionary.common.brandAlt}
            width={260}
            height={260}
            priority
            className="landing-logo"
          />
        </div>
      </div>
      <div className="landing-top-line" aria-hidden="true" />
      <form
        className="event-search"
        role="search"
        aria-label={dictionary.landing.searchAriaLabel}
        action={withLocalePath(locale, '/search')}
        method="get"
      >
        <label htmlFor="event-search-input" className="sr-only">
          {dictionary.landing.searchLabel}
        </label>
        <input
          id="event-search-input"
          name="q"
          type="search"
          placeholder={dictionary.landing.searchPlaceholder}
          className="event-search-input"
        />
        <button type="submit" className="event-search-button">
          {dictionary.landing.searchButton}
        </button>
      </form>

      <section className="landing-cards" aria-label={dictionary.landing.actionsAriaLabel}>
        <article className="landing-card">
          <h2>{dictionary.landing.addEventTitle}</h2>
          <p>{dictionary.landing.addEventDescription}</p>
          <Link href={withLocalePath(locale, '/event/add')} className="landing-card-link">
            {dictionary.landing.addEventCta}
          </Link>
        </article>

        <article className="landing-card">
          <h2>{dictionary.landing.subscribeTitle}</h2>
          <p>{dictionary.landing.subscribeDescription}</p>
          <Link href={withLocalePath(locale, '/subscribe')} className="landing-card-link">
            {dictionary.landing.subscribeCta}
          </Link>
        </article>
      </section>
    </main>
  );
}
