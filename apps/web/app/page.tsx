import Image from 'next/image';
import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="landing">
      <div className="landing-logo-wrap">
        <div className="landing-logo-bg">
          <Image
            src="/event-compass.png"
            alt="Event Compass"
            width={260}
            height={260}
            priority
            className="landing-logo"
          />
        </div>
      </div>
      <div className="landing-top-line" aria-hidden="true" />
      <form className="event-search" role="search" aria-label="Wyszukiwarka wydarzen">
        <label htmlFor="event-search-input" className="sr-only">
          Wyszukaj wydarzenie
        </label>
        <input
          id="event-search-input"
          name="query"
          type="search"
          placeholder="Wpisz nazwe miasta, artysty lub wydarzenia"
          className="event-search-input"
        />
        <button type="submit" className="event-search-button">
          Szukaj
        </button>
      </form>

      <section className="landing-cards" aria-label="Dodatkowe akcje">
        <article className="landing-card">
          <h2>Zglos wydarzenie</h2>
          <p>Masz event? Dodaj go, aby inni mogli go latwo znalezc.</p>
          <Link href="/add-event" className="landing-card-link">
            Przejdz do formularza
          </Link>
        </article>

        <article className="landing-card">
          <h2>Subskrybuj powiadomienia</h2>
          <p>Ustaw filtr i otrzymuj alerty o nowych wydarzeniach.</p>
          <Link href="/subscribe" className="landing-card-link">
            Ustaw subskrypcje
          </Link>
        </article>
      </section>
    </main>
  );
}
