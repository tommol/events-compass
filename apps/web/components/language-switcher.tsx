'use client';

import { usePathname, useRouter } from 'next/navigation';

import { switchLocaleInPath } from '@/lib/i18n/routing';
import type { Dictionary } from '@/lib/i18n/get-dictionary';
import type { Locale } from '@/lib/i18n/locales';

type LanguageSwitcherProps = {
  locale: Locale;
  dictionary: Dictionary;
};

export function LanguageSwitcher({ locale, dictionary }: LanguageSwitcherProps) {
  const pathname = usePathname();
  const router = useRouter();
  const safePathname = pathname ?? `/${locale}`;

  return (
    <div className="language-switcher">
      <label htmlFor="language-switcher-select" className="sr-only">
        {dictionary.common.language.switcherLabel}
      </label>
      <select
        id="language-switcher-select"
        aria-label={dictionary.common.language.switcherLabel}
        className="language-switcher-select"
        value={locale}
        onChange={(event) => {
          const nextLocale = event.target.value as Locale;
          router.push(switchLocaleInPath(safePathname, nextLocale));
        }}
      >
        <option value="en">{dictionary.common.language.english}</option>
        <option value="pl">{dictionary.common.language.polish}</option>
      </select>
    </div>
  );
}
