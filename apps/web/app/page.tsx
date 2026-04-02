import Link from "next/link";
import { CheckCircle, Building2, MailOpen, ShieldCheck, UserCog, Send } from "lucide-react";

export default function HomePage() {
  return (
    <div className="page-shell">
      <nav className="navbar">
        <div className="navbar-brand">
          <div className="navbar-logo-icon">
            <Building2 size={18} strokeWidth={2.5} />
          </div>
          <span className="navbar-brand-name">ExamCraft</span>
        </div>
        <ul className="navbar-links">
          <li>
            <a href="#features">Features</a>
          </li>
          <li>
            <a href="#flows">Workflows</a>
          </li>
        </ul>
        <div className="navbar-cta">
          <Link
            className="secondary-button"
            href="/login"
            style={{ padding: "8px 20px", fontSize: "0.875rem" }}
          >
            Sign in
          </Link>
          <Link
            className="primary-button"
            href="/onboarding"
            style={{ padding: "8px 20px", fontSize: "0.875rem" }}
          >
            Get started
          </Link>
        </div>
      </nav>

      <section className="hero-section">
        <div className="hero-badge">
          <span className="hero-badge-dot" />
          ExamCraft SaaS Platform - v1 Foundation
        </div>

        <h1 className="hero-headline">
          Exam operations, <span className="gradient-text">reimagined</span>
          <br />
          for institutions.
        </h1>

        <p className="hero-subline">
          Multi-tenant exam orchestration for colleges, schools, and coaching teams. Live Supabase auth, cloud tenant setup,
          and backend-validated access control in one platform.
        </p>

        <div className="hero-actions">
          <Link className="primary-button" href="/onboarding">
            Create your institution
          </Link>
          <Link className="secondary-button" href="/login">
            Sign in to dashboard
          </Link>
        </div>

        <div className="stats-row">
          <div className="stat-item">
            <div className="stat-value">24/7</div>
            <div className="stat-label">Tenant coverage</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">100%</div>
            <div className="stat-label">Backend auth control</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">Free</div>
            <div className="stat-label">Starting tier</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">Live</div>
            <div className="stat-label">Supabase wiring</div>
          </div>
        </div>
      </section>

      <section className="features-section" id="features">
        <div id="flows" style={{ display: "grid", gap: "12px", marginBottom: "32px", textAlign: "center" }}>
          <p className="eyebrow" style={{ textAlign: "center" }}>
            Current working flows
          </p>
          <p className="subtle" style={{ textAlign: "center", maxWidth: "480px", margin: "0 auto" }}>
            This is the first vertical slice of the new platform foundation. Everything below is shipped and live.
          </p>
        </div>

        <div className="features-grid">
          <div className="feature-card" style={{ animationDelay: "0.1s" }}>
            <div className="feature-icon">
              <ShieldCheck size={24} className="gradient-text" style={{ color: "var(--brand-accent)" }} />
            </div>
            <div className="feature-title">Supabase Email / Password Auth</div>
            <div className="feature-desc">
              Secure, backend-wired email and password sign-in backed by Supabase Auth. No client-side token meddling.
            </div>
            <span className="feature-tag">Live</span>
          </div>

          <div className="feature-card" style={{ animationDelay: "0.2s" }}>
            <div className="feature-icon">
              <Building2 size={24} style={{ color: "var(--brand-accent)" }} />
            </div>
            <div className="feature-title">Institution Onboarding</div>
            <div className="feature-desc">
              Create a cloud tenant on the free tier, set an institution slug, and link the first admin in one flow.
            </div>
            <span className="feature-tag">Live</span>
          </div>

          <div className="feature-card" style={{ animationDelay: "0.3s" }}>
            <div className="feature-icon">
              <MailOpen size={24} style={{ color: "var(--brand-accent)" }} />
            </div>
            <div className="feature-title">Invitation Preview & Acceptance</div>
            <div className="feature-desc">
              Role-scoped invitation tokens that staff and faculty can preview and accept to join an institution workspace.
            </div>
            <span className="feature-tag">Live</span>
          </div>

          <div className="feature-card" style={{ animationDelay: "0.4s" }}>
            <div className="feature-icon">
              <CheckCircle size={24} style={{ color: "var(--brand-accent)" }} />
            </div>
            <div className="feature-title">Backend Tenant Context</div>
            <div className="feature-desc">
              Every API request validates the selected institution on the backend before access is granted.
            </div>
            <span className="feature-tag">Live</span>
          </div>

          <div className="feature-card" style={{ animationDelay: "0.5s" }}>
            <div className="feature-icon">
              <UserCog size={24} style={{ color: "var(--brand-accent)" }} />
            </div>
            <div className="feature-title">Role & Permission Enforcements</div>
            <div className="feature-desc">
              Guards, middleware hooks, and permission checks are baked into every route instead of bolted on later.
            </div>
            <span className="feature-tag">Live</span>
          </div>

          <div className="feature-card" style={{ animationDelay: "0.6s" }}>
            <div className="feature-icon">
              <Send size={24} style={{ color: "var(--brand-accent)" }} />
            </div>
            <div className="feature-title">Accept an Invite</div>
            <div className="feature-desc">
              Have a token? Accept an invitation to join an institution workspace as a faculty member, admin, or coordinator.
            </div>
            <Link
              className="feature-tag"
              href="/invite"
              style={{ display: "inline-block", cursor: "pointer", textDecoration: "none" }}
            >
              Try it
            </Link>
          </div>
        </div>
      </section>

      <footer
        style={{
          textAlign: "center",
          padding: "40px 24px",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          color: "var(--text-muted)",
          fontSize: "0.825rem",
          marginTop: "auto"
        }}
      >
        <p>Copyright 2026 ExamCraft | QPGS Enterprises | Built for educators, by educators.</p>
      </footer>
    </div>
  );
}
