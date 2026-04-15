'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState, type CSSProperties, type FormEvent } from 'react';
import { z } from 'zod';

import { createEvent } from '@/lib/api';
import { withLocalePath } from '@/lib/i18n/routing';

type AddEventFormDictionary = {
  eventNameLabel: string;
  eventNamePlaceholder: string;
  descriptionLabel: string;
  descriptionPlaceholder: string;
  emailLabel: string;
  emailPlaceholder: string;
  submit: string;
  submitting: string;
  success: string;
  error: string;
  errors: {
    nameRequired: string;
    emailInvalid: string;
  };
};

type AddEventFormProps = {
  locale: string;
  dictionary: AddEventFormDictionary;
};

type FieldErrors = {
  name?: string;
  email?: string;
};

export function AddEventForm({ locale, dictionary }: AddEventFormProps) {
  const router = useRouter();
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const schema = useMemo(
    () =>
      z.object({
        name: z.string().trim().min(1, dictionary.errors.nameRequired),
        email: z.string().trim().email(dictionary.errors.emailInvalid),
        description: z.string().trim().optional(),
      }),
    [dictionary.errors.emailInvalid, dictionary.errors.nameRequired],
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    const formData = new FormData(event.currentTarget);
    const rawInput = {
      name: String(formData.get('name') ?? ''),
      email: String(formData.get('email') ?? ''),
      description: String(formData.get('description') ?? ''),
    };

    const parsed = schema.safeParse(rawInput);

    if (!parsed.success) {
      const nextErrors: FieldErrors = {};

      for (const issue of parsed.error.issues) {
        if (issue.path[0] === 'name') {
          nextErrors.name = issue.message;
        }

        if (issue.path[0] === 'email') {
          nextErrors.email = issue.message;
        }
      }

      setFieldErrors(nextErrors);
      return;
    }

    setFieldErrors({});
    setIsSubmitting(true);

    const result = await createEvent({
      name: parsed.data.name,
      email: parsed.data.email,
      description: parsed.data.description || undefined,
    });

    setIsSubmitting(false);

    if (!result.ok) {
      setFormError(dictionary.error);
      return;
    }

    setFormSuccess(dictionary.success);
    router.push(withLocalePath(locale, `/event/${result.data.slug}`));
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }} noValidate>
      <div style={{ textAlign: 'left' }}>
        <label htmlFor="event-name" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
          {dictionary.eventNameLabel}
        </label>
        <input
          id="event-name"
          name="name"
          type="text"
          placeholder={dictionary.eventNamePlaceholder}
          style={inputStyle}
        />
        {fieldErrors.name ? <p style={errorStyle}>{fieldErrors.name}</p> : null}
      </div>

      <div style={{ textAlign: 'left' }}>
        <label htmlFor="event-description" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
          {dictionary.descriptionLabel}
        </label>
        <textarea
          id="event-description"
          name="description"
          placeholder={dictionary.descriptionPlaceholder}
          rows={4}
          style={{ ...inputStyle, resize: 'vertical' }}
        />
      </div>

      <div style={{ textAlign: 'left' }}>
        <label htmlFor="event-email" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
          {dictionary.emailLabel}
        </label>
        <input
          id="event-email"
          name="email"
          type="email"
          placeholder={dictionary.emailPlaceholder}
          style={inputStyle}
        />
        {fieldErrors.email ? <p style={errorStyle}>{fieldErrors.email}</p> : null}
      </div>

      {formError ? <p style={errorStyle}>{formError}</p> : null}

      <button
        type="submit"
        disabled={isSubmitting}
        style={{
          padding: '1rem 2rem',
          background: 'linear-gradient(180deg, #f472b6 0%, #ec4899 50%, #db2777 100%)',
          color: '#ffffff',
          border: 'none',
          borderRadius: '0.8rem',
          fontWeight: 700,
          fontSize: '1.1rem',
          cursor: isSubmitting ? 'not-allowed' : 'pointer',
          opacity: isSubmitting ? 0.75 : 1,
        }}
      >
        {isSubmitting ? dictionary.submitting : dictionary.submit}
      </button>

      {formSuccess ? <p style={{ color: '#166534', marginTop: '0.2rem' }}>{formSuccess}</p> : null}
    </form>
  );
}

const inputStyle: CSSProperties = {
  width: '100%',
  padding: '0.75rem 1rem',
  borderRadius: '0.7rem',
  border: '1px solid rgba(148, 163, 184, 0.55)',
  background: '#ffffff',
  fontSize: '1rem',
};

const errorStyle: CSSProperties = {
  color: '#b91c1c',
  marginTop: '0.5rem',
  marginBottom: 0,
  fontSize: '0.95rem',
};
