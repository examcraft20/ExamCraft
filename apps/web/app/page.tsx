import Link from "next/link";

export default function HomePage() {
  return (
    <main className="page-shell">
      <section className="hero-grid">
        <div className="hero-copy">
          <p className="eyebrow">ExamCraft SaaS</p>
          <h1>Multi-tenant exam operations for colleges, schools, and coaching teams.</h1>
          <p className="subtle">
            The first build now includes live Supabase auth wiring, cloud tenant setup, invitation
            acceptance, and backend-owned access control.
          </p>
          <div className="hero-actions">
            <Link className="primary-button" href="/login">
              Sign in
            </Link>
            <Link className="secondary-button" href="/onboarding">
              Create institution
            </Link>
          </div>
        </div>

        <div className="panel stack-list">
          <div>
            <h2>Current working flows</h2>
            <p className="subtle">
              This is the first vertical slice of the new platform foundation.
            </p>
          </div>
          <ul>
            <li>Supabase email/password sign-in</li>
            <li>Institution onboarding on the free tier</li>
            <li>Invitation preview and acceptance</li>
            <li>Backend tenant context resolution</li>
            <li>Role and permission enforcement hooks</li>
          </ul>
          <Link className="secondary-button" href="/invite">
            Accept an invite
          </Link>
        </div>
      </section>
    </main>
  );
}
