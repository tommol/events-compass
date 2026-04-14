import Link from 'next/link';

export default function SearchPage() {
  return (
    <>
      <h1 className="page-header-title">Search Results</h1>
      <h2 style={{ fontSize: '2rem', marginBottom: '2rem' }}>Search Results</h2>
      <p style={{ fontSize: '1.1rem', color: '#64748b' }}>
        No events found. Try adjusting your search criteria.
      </p>
      <Link
        href="/"
        style={{
          display: 'inline-block',
          marginTop: '2rem',
          padding: '0.95rem 1.35rem',
          backgroundColor: '#ec4899',
          color: '#ffffff',
          borderRadius: '0.7rem',
          textDecoration: 'none',
          fontWeight: 700,
        }}
      >
        Back to Home
      </Link>
    </>
  );
}
