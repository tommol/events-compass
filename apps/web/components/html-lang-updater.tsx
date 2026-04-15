'use client';

import { useEffect } from 'react';

import type { Locale } from '@/lib/i18n/locales';

type HtmlLangUpdaterProps = {
  locale: Locale;
};

export function HtmlLangUpdater({ locale }: HtmlLangUpdaterProps) {
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return null;
}
