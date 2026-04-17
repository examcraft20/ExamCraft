import { Metadata } from "next";
import { TemplatesPageClient } from "./templates-client";

export const metadata: Metadata = {
  title: 'Paper Templates',
};

export default function TemplatesPage() {
  return <TemplatesPageClient />;
}
