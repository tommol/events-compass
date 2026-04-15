import { render, screen } from '@testing-library/react';

import HomePage from './[locale]/page';
import SearchPage from './[locale]/(pages)/search/page';

jest.mock('next/navigation', () => ({
  usePathname: () => '/en',
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

describe('HomePage', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.resetAllMocks();
  });

  it('renders English landing page with locale-aware links', async () => {
    render(await HomePage({ params: Promise.resolve({ locale: 'en' }) }));

    expect(screen.getByAltText('Event Compass')).toBeInTheDocument();
    expect(screen.getByRole('searchbox')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Search' })).toBeInTheDocument();
    expect(screen.getByRole('search')).toHaveAttribute('action', '/en/search');
    expect(screen.getByRole('heading', { name: 'Submit an event' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Subscribe to notifications' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Open form' })).toHaveAttribute('href', '/en/event/add');
    expect(screen.getByRole('link', { name: 'Set subscription' })).toHaveAttribute('href', '/en/subscribe');
  });

  it('renders Polish landing page with locale-aware links', async () => {
    render(await HomePage({ params: Promise.resolve({ locale: 'pl' }) }));

    expect(screen.getByRole('button', { name: 'Szukaj' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Zglos wydarzenie' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Subskrybuj powiadomienia' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Przejdz do formularza' })).toHaveAttribute('href', '/pl/event/add');
    expect(screen.getByRole('link', { name: 'Ustaw subskrypcje' })).toHaveAttribute('href', '/pl/subscribe');
  });

  it('renders search results page with matching events', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ([
        {
          id: 'evt-1',
          name: 'Frontend Meetup',
          slug: 'frontend-meetup',
          city: 'Warsaw',
        },
      ]),
    } as Response);

    render(
      await SearchPage({
        params: Promise.resolve({ locale: 'en' }),
        searchParams: Promise.resolve({ q: 'frontend' }),
      }),
    );

    expect(screen.queryByRole('heading', { name: 'Search Results' })).not.toBeInTheDocument();
    expect(screen.getByRole('search')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Frontend Meetup' })).toHaveAttribute(
      'href',
      '/en/event/frontend-meetup?backTo=%2Fen%2Fsearch%3Fq%3Dfrontend%26limit%3D12',
    );
  });
});
