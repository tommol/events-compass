import { render, screen } from '@testing-library/react';

import EventPage from './[locale]/(pages)/event/[eventSlug]/page';
import AddEventPage from './[locale]/(pages)/event/add/page';
import EditEventPage from './[locale]/(pages)/event/[eventSlug]/edit/[tokenHash]/page';
import RequestEditErrorPage from './[locale]/(pages)/event/[eventSlug]/request-edit/error/page';
import RequestEditSuccessPage from './[locale]/(pages)/event/[eventSlug]/request-edit/success/page';

jest.mock('next/navigation', () => ({
  notFound: jest.fn(),
  redirect: jest.fn(),
  usePathname: () => '/en',
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

describe('event pages', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.resetAllMocks();
  });

  it('renders event details page with request token form', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        id: 'evt-1',
        name: 'Frontend Meetup',
        slug: 'frontend-meetup',
        description: 'Meetup for engineers',
        city: 'Warsaw',
      }),
    } as Response);

    render(
      await EventPage({
        params: Promise.resolve({ locale: 'en', eventSlug: 'frontend-meetup' }),
        searchParams: Promise.resolve({}),
      }),
    );

    expect(screen.getByRole('heading', { name: 'Frontend Meetup' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Description' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Edit Event' })).toBeInTheDocument();
  });

  it('renders request-edit success page', async () => {
    render(
      await RequestEditSuccessPage({
        params: Promise.resolve({ locale: 'en', eventSlug: 'frontend-meetup' }),
      }),
    );

    expect(screen.getByRole('heading', { name: 'Token request sent' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Back to event' })).toHaveAttribute('href', '/en/event/frontend-meetup');
  });

  it('renders request-edit error page', async () => {
    render(
      await RequestEditErrorPage({
        params: Promise.resolve({ locale: 'en', eventSlug: 'frontend-meetup' }),
      }),
    );

    expect(screen.getByRole('heading', { name: 'Token request failed' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Try again' })).toHaveAttribute('href', '/en/event/frontend-meetup');
  });

  it('renders edit page with prefilled form fields', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        id: 'evt-1',
        name: 'Frontend Meetup',
        slug: 'frontend-meetup',
        description: 'Meetup for engineers',
        city: 'Warsaw',
      }),
    } as Response);

    render(
      await EditEventPage({
        params: Promise.resolve({ locale: 'en', eventSlug: 'frontend-meetup', tokenHash: 'tok-1' }),
      }),
    );

    expect(screen.getByRole('heading', { name: 'Edit event' })).toBeInTheDocument();
    expect(screen.getByLabelText('Description')).toHaveValue('Meetup for engineers');
    expect(screen.getByLabelText('City')).toHaveValue('Warsaw');
    expect(screen.getByRole('button', { name: 'Save changes' })).toBeInTheDocument();
  });

  it('renders add event page under /event/add', async () => {
    render(
      await AddEventPage({
        params: Promise.resolve({ locale: 'en' }),
      }),
    );

    expect(screen.getByRole('heading', { name: 'Submit Upcoming Event' })).toBeInTheDocument();
    expect(screen.getByLabelText('Event Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Your email')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create Event' })).toBeInTheDocument();
  });
});
