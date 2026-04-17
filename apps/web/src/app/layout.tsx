import type { Metadata, Viewport } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-inter",
  display: "swap",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: 'ExamCraft',
    template: '%s | ExamCraft',
  },
  description: 'The modern platform for academic assessment and exam operations',
  keywords: "exam, assessment, education, multi-tenant, institution, college, school",
  openGraph: {
    title: "ExamCraft",
    description: "The modern platform for academic assessment and exam operations",
    type: "website"
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${plusJakartaSans.variable}`}>
      <body>
        {children}
        <Toaster position="top-right" richColors theme="dark" />
      </body>
    </html>
  );
}
