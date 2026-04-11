import { Metadata } from "next";
import { SubjectsPageClient } from "./subjects-client";

export const metadata: Metadata = {
  title: 'My Subjects',
};

export default function SubjectsPage() {
  return <SubjectsPageClient />;
}
