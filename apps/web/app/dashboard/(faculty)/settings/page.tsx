import { Metadata } from "next";
import { SettingsClient } from "../../../../components/dashboard/faculty/settings-client";

export const metadata: Metadata = {
  title: 'Settings',
};

export default function SettingsPage() {
  return <SettingsClient />;
}
