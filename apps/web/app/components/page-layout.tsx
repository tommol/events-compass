import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

interface PageLayoutProps {
  title: string;
  children: React.ReactNode;
}

export function PageLayout({ title, children }: PageLayoutProps) {
  return (
    <div className="page-wrapper">
      <header className="page-header">
        <Link href="/" className="page-header-logo">
          <Image
            src="/event-compass.png"
            alt="Event Compass"
            width={48}
            height={48}
            priority
          />
        </Link>
        <h1 className="page-header-title">{title}</h1>
      </header>

      <main className="page-content">
        <section className="page-section">
          {children}
        </section>
      </main>
    </div>
  );
}
