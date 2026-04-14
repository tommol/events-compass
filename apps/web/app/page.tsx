import { fetchHealthStatus } from '../lib/api';

export default async function HomePage() {
  const health = await fetchHealthStatus();

  return (
    <main className="container">
      <h1>Events Compass</h1>
      <p>Monorepo starter with Next.js + NestJS.</p>
      <section className="status-card">
        <h2>Backend status</h2>
        {health ? (
          <ul>
            <li>status: {health.status}</li>
            <li>service: {health.service}</li>
            <li>database: {health.database}</li>
            <li>timestamp: {health.timestamp}</li>
          </ul>
        ) : (
          <p>Backend unavailable. Check if API is running.</p>
        )}
      </section>
    </main>
  );
}
