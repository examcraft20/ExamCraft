import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "ExamCraft - Multi-tenant Exam Operations Platform",
  description:
    "ExamCraft is the all-in-one exam operations platform for colleges, schools, and coaching teams. Secure, scalable, and built for education.",
  keywords: "exam, assessment, education, multi-tenant, institution, college, school",
  openGraph: {
    title: "ExamCraft - Multi-tenant Exam Operations Platform",
    description: "The first platform built specifically for institutional exam orchestration at scale.",
    type: "website"
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com" rel="preconnect" />
        <link crossOrigin="anonymous" href="https://fonts.gstatic.com" rel="preconnect" />
      </head>
      <body>
        {children}
        <Toaster position="top-right" richColors theme="dark" />
      </body>
    </html>
  );
}
