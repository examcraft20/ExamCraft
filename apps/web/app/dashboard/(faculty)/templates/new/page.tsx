import { Metadata } from "next";
import { NewTemplatePageClient } from "./new-template-client";

export const metadata: Metadata = {
  title: 'Create Paper Template',
};

export default function NewTemplatePage() {
  return <NewTemplatePageClient />;
}
