import { Metadata } from "next";
import { SubmissionsPageClient } from "./submissions-client";

export const metadata: Metadata = {
  title: 'My Submissions',
};

export default function SubmissionsPage() {
  return <SubmissionsPageClient />;
}
