import { render, screen } from '@testing-library/react';

import HomePage from './page';

describe('HomePage', () => {
  it('renders landing page with search and action cards', () => {
    render(<HomePage />);

    expect(screen.getByAltText('Event Compass')).toBeInTheDocument();
    expect(screen.getByRole('searchbox')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Szukaj' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Zglos wydarzenie' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Subskrybuj powiadomienia' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Przejdz do formularza' })).toHaveAttribute(
      'href',
      '/wydarzenia/zglos'
    );
    expect(screen.getByRole('link', { name: 'Ustaw subskrypcje' })).toHaveAttribute(
      'href',
      '/powiadomienia/subskrybuj'
    );
  });
});
