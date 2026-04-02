"use client";

import { Card } from "@examcraft/ui";
import { ArrowRight, Building2, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

type AuthShellProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
  brandTitle: ReactNode;
  brandSubtitle: string;
  features: string[];
  children: ReactNode;
  footerLinks?: Array<{ href: string; label: ReactNode }>;
};

const brandIcons = [ShieldCheck, Building2, Sparkles, ArrowRight];

export function AuthShell({
  eyebrow,
  title,
  subtitle,
  brandTitle,
  brandSubtitle,
  features,
  children,
  footerLinks = []
}: AuthShellProps) {
  return (
    <div className="auth-shell">
      <aside className="auth-side-brand">
        <div className="auth-brand-grid" />
        <div className="auth-brand-orb auth-brand-orb-primary" />
        <div className="auth-brand-orb auth-brand-orb-secondary" />

        <div className="auth-brand-content">
          <div className="auth-brand-logo">
            <div className="auth-brand-logo-icon">
              <Building2 size={20} strokeWidth={2.2} />
            </div>
            <span className="auth-brand-logo-text">ExamCraft</span>
          </div>

          <div className="auth-brand-badge">
            <Sparkles size={14} />
            Premium exam operations
          </div>

          <h2 className="auth-brand-headline">{brandTitle}</h2>
          <p className="auth-brand-subline">{brandSubtitle}</p>

          <ul className="auth-feature-list">
            {features.map((feature, index) => {
              const Icon = brandIcons[index % brandIcons.length];
              return (
                <li key={feature} className="auth-feature-item">
                  <span className="auth-feature-check">
                    <Icon size={14} />
                  </span>
                  {feature}
                </li>
              );
            })}
          </ul>
        </div>
      </aside>

      <main className="auth-side-form">
        <Card className="auth-card-surface" glow padding="lg" style={{ width: "100%", maxWidth: "520px" }}>
          <div className="form-card-inner">
            <div className="form-eyebrow">
              <span className="form-eyebrow-dot" />
              {eyebrow}
            </div>
            <h1 className="form-title">{title}</h1>
            <p className="form-subtitle">{subtitle}</p>
            {children}
            {footerLinks.length > 0 ? (
              <div className="inline-links">
                {footerLinks.map((link) => (
                  <Link href={link.href} key={link.href}>
                    {link.label}
                  </Link>
                ))}
              </div>
            ) : null}
          </div>
        </Card>
      </main>
    </div>
  );
}
