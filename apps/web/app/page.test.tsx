import { render, screen } from '@testing-library/react';

import HomePage from './[locale]/page';

jest.mock('next/navigation', () => ({
  usePathname: () => '/en',
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

describe('HomePage', () => {
  it('renders English landing page with locale-aware links', async () => {
    render(await HomePage({ params: Promise.resolve({ locale: 'en' }) }));

    expect(screen.getByAltText('Event Compass')).toBeInTheDocument();
    expect(screen.getByRole('searchbox')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Search' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Submit an event' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Subscribe to notifications' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Open form' })).toHaveAttribute('href', '/en/add-event');
    expect(screen.getByRole('link', { name: 'Set subscription' })).toHaveAttribute('href', '/en/subscribe');
  });

  it('renders Polish landing page with locale-aware links', async () => {
    render(await HomePage({ params: Promise.resolve({ locale: 'pl' }) }));

    expect(screen.getByRole('button', { name: 'Szukaj' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Zglos wydarzenie' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Subskrybuj powiadomienia' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Przejdz do formularza' })).toHaveAttribute('href', '/pl/add-event');
    expect(screen.getByRole('link', { name: 'Ustaw subskrypcje' })).toHaveAttribute('href', '/pl/subscribe');
  });
});
