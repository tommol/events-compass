import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

export default function PagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="page-wrapper">
      <header className="page-header">
        <Link href="/" className="page-header-logo" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
          <Image
            src="/logo.png"
            alt="Event Compass"
            width={48}
            height={48}
            priority
          />
          <span style={{ fontSize: '1.6rem', fontWeight: 900, display: 'flex', gap: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <span style={{ background: 'linear-gradient(90deg, #ec4899 0%, #be185d 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Event
            </span>
            <span style={{ background: 'linear-gradient(90deg, #0ea5e9 0%, #06b6d4 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Compass
            </span>
          </span>
        </Link>
      </header>

      <main className="page-content">
        <section className="page-section">
          {children}
        </section>
      </main>
    </div>
  );
}
