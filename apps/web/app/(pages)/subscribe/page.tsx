import Link from 'next/link';

export default function SubscribePage() {
  return (
    <>
      <h1 className="page-header-title">Subscribe to Notifications</h1>
      <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Get Event Notifications</h2>
      <p style={{ fontSize: '1.1rem', color: '#64748b', marginBottom: '2rem' }}>
        Set up filters and receive alerts about new events matching your interests.
      </p>
      <form style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ textAlign: 'left' }}>
          <label htmlFor="city" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
            City
          </label>
          <input
            id="city"
            type="text"
            placeholder="Enter city name"
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
          <label htmlFor="category" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
            Event Category
          </label>
          <select
            id="category"
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              borderRadius: '0.7rem',
              border: '1px solid rgba(255, 255, 255, 0.35)',
              background: 'rgba(255, 255, 255, 0.18)',
              backdropFilter: 'blur(6px)',
              fontSize: '1rem',
            }}
          >
            <option value="">Select a category</option>
            <option value="music">Music</option>
            <option value="sports">Sports</option>
            <option value="art">Art</option>
            <option value="tech">Technology</option>
          </select>
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
          Subscribe to Notifications
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
