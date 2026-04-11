import { Metadata } from "next";
import { PapersPageClient } from "./papers-client";

export const metadata: Metadata = {
  title: 'Exam Papers',
};

export default function PapersPage() {
  return <PapersPageClient />;
}
