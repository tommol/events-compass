import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';

import { getEventByToken, type UpdateEventPayload, updateEvent } from '@/lib/api';
import { getDictionary } from '@/lib/i18n/get-dictionary';
import { isLocale } from '@/lib/i18n/locales';
import { withLocalePath } from '@/lib/i18n/routing';

type EditEventPageProps = {
  params: Promise<{ locale: string; eventSlug: string; tokenHash: string }>;
};

export async function generateMetadata({ params }: EditEventPageProps): Promise<Metadata> {
  const { locale } = await params;

  if (!isLocale(locale)) {
    return {};
  }

  const dictionary = getDictionary(locale);

  return {
    title: dictionary.eventEdit.pageTitle,
  };
}

export default async function EditEventPage({ params }: EditEventPageProps) {
  const { locale, eventSlug, tokenHash } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const dictionary = getDictionary(locale);
  const eventResult = await getEventByToken(tokenHash);

  if (!eventResult.ok || eventResult.data.slug !== eventSlug) {
    notFound();
  }

  const event = eventResult.data;

  async function handleEditEvent(formData: FormData) {
    'use server';

    const payload: UpdateEventPayload = {
      description: normalizeText(formData.get('description')),
      country: normalizeText(formData.get('country')),
      city: normalizeText(formData.get('city')),
      region: normalizeText(formData.get('region')),
      postalCode: normalizeText(formData.get('postalCode')),
      address: normalizeText(formData.get('address')),
      venue: normalizeText(formData.get('venue')),
      startAt: toIsoOrUndefined(formData.get('startAt')),
      endAt: toIsoOrUndefined(formData.get('endAt')),
    };

    const result = await updateEvent(eventSlug, tokenHash, payload);

    if (result.ok) {
      redirect(withLocalePath(locale, `/event/${result.data.slug}?updated=1`));
    }

    redirect(withLocalePath(locale, `/event/${eventSlug}/request-edit/error`));
  }

  return (
    <>
      <h1 className="page-header-title">{dictionary.eventEdit.pageTitle}</h1>
      <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>{dictionary.eventEdit.sectionTitle}</h2>
      <p style={{ marginBottom: '1.5rem', color: '#475569' }}>{dictionary.eventEdit.description}</p>
      <form action={handleEditEvent} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'left' }}>
        <FormField id="description" label={dictionary.event.fields.description} defaultValue={event.description ?? ''} />
        <FormField id="country" label={dictionary.event.fields.country} defaultValue={event.country ?? ''} />
        <FormField id="city" label={dictionary.event.fields.city} defaultValue={event.city ?? ''} />
        <FormField id="region" label={dictionary.event.fields.region} defaultValue={event.region ?? ''} />
        <FormField id="postalCode" label={dictionary.event.fields.postalCode} defaultValue={event.postalCode ?? ''} />
        <FormField id="address" label={dictionary.event.fields.address} defaultValue={event.address ?? ''} />
        <FormField id="venue" label={dictionary.event.fields.venue} defaultValue={event.venue ?? ''} />
        <FormField
          id="startAt"
          label={dictionary.event.fields.startAt}
          type="datetime-local"
          defaultValue={toDateTimeInputValue(event.startAt)}
        />
        <FormField
          id="endAt"
          label={dictionary.event.fields.endAt}
          type="datetime-local"
          defaultValue={toDateTimeInputValue(event.endAt)}
        />

        <button
          type="submit"
          style={{
            width: 'fit-content',
            marginTop: '0.5rem',
            padding: '0.9rem 1.35rem',
            borderRadius: '0.7rem',
            border: 'none',
            background: 'linear-gradient(180deg, #f472b6 0%, #ec4899 50%, #db2777 100%)',
            color: '#ffffff',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          {dictionary.eventEdit.submit}
        </button>
      </form>

      <Link
        href={withLocalePath(locale, `/event/${eventSlug}`)}
        style={{
          display: 'inline-block',
          marginTop: '2rem',
          color: '#ec4899',
          textDecoration: 'none',
          fontWeight: 600,
        }}
      >
        {dictionary.eventEdit.backToEvent}
      </Link>
    </>
  );
}

type FormFieldProps = {
  id: keyof UpdateEventPayload;
  label: string;
  defaultValue: string;
  type?: 'text' | 'datetime-local';
};

function FormField({ id, label, defaultValue, type = 'text' }: FormFieldProps) {
  return (
    <div>
      <label htmlFor={id} style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        defaultValue={defaultValue}
        style={{
          width: '100%',
          padding: '0.75rem 1rem',
          borderRadius: '0.7rem',
          border: '1px solid rgba(148, 163, 184, 0.55)',
          background: '#ffffff',
          fontSize: '1rem',
        }}
      />
    </div>
  );
}

function normalizeText(value: FormDataEntryValue | null): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }

  const normalized = value.trim();
  return normalized.length > 0 ? normalized : undefined;
}

function toIsoOrUndefined(value: FormDataEntryValue | null): string | undefined {
  if (typeof value !== 'string' || !value.trim()) {
    return undefined;
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return undefined;
  }

  return parsed.toISOString();
}

function toDateTimeInputValue(value: string | undefined): string {
  if (!value) {
    return '';
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return '';
  }

  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, '0');
  const day = String(parsed.getDate()).padStart(2, '0');
  const hours = String(parsed.getHours()).padStart(2, '0');
  const minutes = String(parsed.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}
