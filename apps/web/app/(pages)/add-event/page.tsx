import Link from 'next/link';

export default function AddEventPage() {
  return (
    <>
      <h1 className="page-header-title">Add New Event</h1>
      <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Submit Your Event</h2>
      <form style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ textAlign: 'left' }}>
          <label htmlFor="event-name" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
            Event Name
          </label>
          <input
            id="event-name"
            type="text"
            placeholder="Enter event name"
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              borderRadius: '0.7rem',
              border: '1px solid rgba(255, 255, 255, 0.35)',
              background: 'rgba(255, 255, 255, 0.18)',
              backdropFilter: 'blur(6px)',
              fontSize: '1rem',
            }}
          />
        </div>
        <div style={{ textAlign: 'left' }}>
          <label htmlFor="event-location" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
            Location
          </label>
          <input
            id="event-location"
            type="text"
            placeholder="Enter event location"
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              borderRadius: '0.7rem',
              border: '1px solid rgba(255, 255, 255, 0.35)',
              background: 'rgba(255, 255, 255, 0.18)',
              backdropFilter: 'blur(6px)',
              fontSize: '1rem',
            }}
          />
        </div>
        <button
          type="submit"
          style={{
            padding: '1rem 2rem',
            background: 'linear-gradient(180deg, #f472b6 0%, #ec4899 50%, #db2777 100%)',
            color: '#ffffff',
            border: 'none',
            borderRadius: '0.8rem',
            fontWeight: 700,
            fontSize: '1.1rem',
            cursor: 'pointer',
          }}
        >
          Submit Event
        </button>
      </form>
      <Link
        href="/"
        style={{
          display: 'inline-block',
          marginTop: '2rem',
          color: '#ec4899',
          textDecoration: 'none',
          fontWeight: 600,
        }}
      >
        ← Back to Home
      </Link>
    </>
  );
}
