import en from './dictionaries/en.json';
import pl from './dictionaries/pl.json';
import type { Locale } from './locales';

const dictionaries = {
  en,
  pl,
} as const;

export type Dictionary = (typeof dictionaries)['en'];

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}
