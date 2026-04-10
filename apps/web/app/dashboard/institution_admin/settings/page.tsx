"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Settings, Save, RotateCcw, Building2, FileText, SlidersHorizontal } from "lucide-react";
import { getSupabaseBrowserSession } from "../../../../lib/supabase-browser";
import { apiRequest } from "#api";
import { useInstitution } from "../../../../hooks/use-institution";
import { Spinner } from "@examcraft/ui";
import { getSupabaseBrowserClient } from "../../../../lib/supabase-browser";

type InstitutionSettings = {
  name: string;
  shortName: string;
  university: string;
  address: string;
  examInstructions: string;
  logoUrl?: string;
  primaryColor?: string;
  defaultExamDuration?: number;
  defaultTotalMarks?: number;
  allowBulkImport?: boolean;
  requireReviewBeforePublish?: boolean;
};

const defaultSettings: InstitutionSettings = {
  name: "",
  shortName: "",
  university: "",
  address: "",
  examInstructions: "Attempt all sections. Read each question carefully. All questions are compulsory unless stated otherwise.",
  primaryColor: "#6366f1",
  defaultExamDuration: 180,
  defaultTotalMarks: 100,
  allowBulkImport: true,
  requireReviewBeforePublish: true,
};

import { useAdminContext } from "../../../../hooks/use-admin-context";

const TABS = [
  { id: "institution", label: "Institution", icon: Building2 },
  { id: "paper", label: "Paper Config", icon: FileText },
  { id: "preferences", label: "Preferences", icon: SlidersHorizontal },
] as const;

export default function SettingsPage() {
  const { accessToken, institutionId, isReady } = useAdminContext();
  const { institutionName } = useInstitution();

  const [settings, setSettings] = useState<InstitutionSettings>(defaultSettings);
  const [original, setOriginal] = useState<InstitutionSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [activeTab, setActiveTab] = useState<"institution" | "paper" | "preferences">("institution");

  // Load branding/settings from the institution record via Supabase directly
  useEffect(() => {
    if (!accessToken || !institutionId) return;
    let mounted = true;

    const load = async () => {
      setIsLoading(true);
      try {
        const supabase = getSupabaseBrowserClient();
        const { data } = await supabase
          .from("institutions")
          .select("name, slug, branding_config, settings_config")
          .eq("id", institutionId)
          .single();

        if (mounted && data) {
          const branding = (data as any).branding_config || {};
          const cfg = (data as any).settings_config || {};
          const merged: InstitutionSettings = {
            name: (data as any).name || "",
            shortName: branding.shortName || "",
            university: branding.university || "",
            address: branding.address || "",
            examInstructions: cfg.examInstructions || defaultSettings.examInstructions,
            logoUrl: branding.logoUrl || "",
            primaryColor: branding.primaryColor || "#6366f1",
            defaultExamDuration: cfg.defaultExamDuration ?? 180,
            defaultTotalMarks: cfg.defaultTotalMarks ?? 100,
            allowBulkImport: cfg.allowBulkImport ?? true,
            requireReviewBeforePublish: cfg.requireReviewBeforePublish ?? true,
          };
          setSettings(merged);
          setOriginal(merged);
        }
      } catch (e) {
        // Supabase direct not available, use branding API endpoint
        try {
          const res = await apiRequest<any>("/tenant/context", { method: "GET", accessToken: accessToken!, institutionId: institutionId! });
          if (mounted && res?.tenantContext) {
            const partial = {
              ...defaultSettings,
              name: institutionName || "",
            };
            setSettings(partial);
            setOriginal(partial);
          }
        } catch (_) {}
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    void load();
  }, [accessToken, institutionId]);

  const handleSave = async () => {
    if (!accessToken || !institutionId) return;
    setIsSaving(true);
    setStatus(null);
    try {
      await apiRequest("/tenant/branding", {
        method: "PATCH",
        accessToken,
        institutionId,
        body: JSON.stringify({
          shortName: settings.shortName,
          university: settings.university,
          address: settings.address,
          primaryColor: settings.primaryColor,
          logoUrl: settings.logoUrl,
        }),
      });
      setOriginal(settings);
      setStatus({ type: "success", msg: "Settings saved successfully." });
    } catch (e) {
      setStatus({ type: "error", msg: e instanceof Error ? e.message : "Failed to save settings." });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setSettings(original);
    setStatus(null);
  };

  const isDirty = JSON.stringify(settings) !== JSON.stringify(original);

  if (!accessToken || isLoading) return <div className="flex items-center justify-center min-h-[60vh]"><Spinner size="lg" className="w-12 h-12" /></div>;

  return (
    <div className="flex flex-col gap-8 pb-10 max-w-3xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-500/10 border border-slate-500/20 flex items-center justify-center text-slate-400">
            <Settings size={20} />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white">Settings</h1>
            <p className="text-[#8b9bb4] text-sm font-medium">Configure institution details and system preferences</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleReset}
            disabled={!isDirty || isSaving}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1e293b] border border-white/10 text-sm font-bold text-[#8b9bb4] hover:text-white transition-all disabled:opacity-40"
          >
            <RotateCcw size={14} /> Reset
          </button>
          <button
            onClick={handleSave}
            disabled={!isDirty || isSaving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-500 transition-all disabled:opacity-50 shadow-lg"
          >
            {isSaving ? <Spinner size="sm" /> : <Save size={14} />}
            Save Settings
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[#1e293b] p-1.5 rounded-xl w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === tab.id ? "bg-[#544bc3] text-white shadow" : "text-[#8b9bb4] hover:text-white"}`}
          >
            <tab.icon size={15} /> {tab.label}
          </button>
        ))}
      </div>

      {/* Status Banner */}
      {status && (
        <div className={`px-5 py-3 rounded-xl text-sm font-medium flex items-center gap-2 ${status.type === "success" ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"}`}>
          {status.type === "success" ? "✅" : "❌"} {status.msg}
        </div>
      )}

      {/* Institution Tab */}
      {activeTab === "institution" && (
        <div className="bg-[#1e293b] border border-white/5 rounded-2xl p-8 flex flex-col gap-6">
          <div className="flex items-center gap-2 mb-2">
            <Building2 size={16} className="text-[#8b9bb4]" />
            <h2 className="text-base font-black text-white uppercase tracking-widest text-[13px]">Institution Details</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#8b9bb4]">Institution Full Name</label>
              <input
                value={settings.name}
                onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                className="bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-[#8b9bb4] focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="Sinhgad Institute of Technology"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#8b9bb4]">Short Name / Acronym</label>
              <input
                value={settings.shortName}
                onChange={(e) => setSettings({ ...settings, shortName: e.target.value })}
                className="bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-[#8b9bb4] focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="SIT"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-[#8b9bb4]">University / Affiliation</label>
            <input
              value={settings.university}
              onChange={(e) => setSettings({ ...settings, university: e.target.value })}
              className="bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-[#8b9bb4] focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="Savitribai Phule Pune University"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-[#8b9bb4]">Address</label>
            <input
              value={settings.address}
              onChange={(e) => setSettings({ ...settings, address: e.target.value })}
              className="bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-[#8b9bb4] focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="Lonavala, Pune"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-[#8b9bb4]">Default Exam Instructions</label>
            <textarea
              value={settings.examInstructions}
              onChange={(e) => setSettings({ ...settings, examInstructions: e.target.value })}
              rows={3}
              className="bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-[#8b9bb4] focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
              placeholder="Attempt all sections..."
            />
          </div>

          {isDirty && (
            <p className="text-xs text-yellow-400 flex items-center gap-2">
              💡 Changes are not saved until you click <strong>Save Settings</strong>
            </p>
          )}

          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={!isDirty || isSaving}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-500 transition-all disabled:opacity-50"
            >
              {isSaving ? <Spinner size="sm" /> : <Save size={14} />} Save Settings
            </button>
          </div>
        </div>
      )}

      {/* Paper Config Tab */}
      {activeTab === "paper" && (
        <div className="bg-[#1e293b] border border-white/5 rounded-2xl p-8 flex flex-col gap-6">
          <div className="flex items-center gap-2 mb-2">
            <FileText size={16} className="text-[#8b9bb4]" />
            <h2 className="text-[13px] font-black text-white uppercase tracking-widest">Paper Configuration</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#8b9bb4]">Default Duration (minutes)</label>
              <input
                type="number"
                value={settings.defaultExamDuration}
                onChange={(e) => setSettings({ ...settings, defaultExamDuration: Number(e.target.value) })}
                className="bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#8b9bb4]">Default Total Marks</label>
              <input
                type="number"
                value={settings.defaultTotalMarks}
                onChange={(e) => setSettings({ ...settings, defaultTotalMarks: Number(e.target.value) })}
                className="bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-[#8b9bb4]">Institution Brand Color</label>
            <div className="flex items-center gap-4">
              <input
                type="color"
                value={settings.primaryColor}
                onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                className="w-12 h-12 rounded-xl border border-white/10 cursor-pointer bg-transparent"
              />
              <input
                value={settings.primaryColor}
                onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                className="flex-1 bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="#6366f1"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-[#8b9bb4]">Logo URL</label>
            <input
              value={settings.logoUrl}
              onChange={(e) => setSettings({ ...settings, logoUrl: e.target.value })}
              className="bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-[#8b9bb4] focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="https://..."
            />
          </div>

          <div className="flex justify-end">
            <button onClick={handleSave} disabled={!isDirty || isSaving}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-500 transition-all disabled:opacity-50">
              {isSaving ? <Spinner size="sm" /> : <Save size={14} />} Save Settings
            </button>
          </div>
        </div>
      )}

      {/* Preferences Tab */}
      {activeTab === "preferences" && (
        <div className="bg-[#1e293b] border border-white/5 rounded-2xl p-8 flex flex-col gap-6">
          <div className="flex items-center gap-2 mb-2">
            <SlidersHorizontal size={16} className="text-[#8b9bb4]" />
            <h2 className="text-[13px] font-black text-white uppercase tracking-widest">Workflow Preferences</h2>
          </div>

          {[
            { key: "allowBulkImport" as const, label: "Allow Bulk CSV Import", desc: "Faculty members can import questions via CSV files." },
            { key: "requireReviewBeforePublish" as const, label: "Require Review Before Publishing", desc: "All questions and papers must be approved by admin before becoming active." },
          ].map((pref) => (
            <div key={pref.key} className="flex items-start justify-between gap-6 p-5 rounded-xl bg-[#0f172a] border border-white/5">
              <div>
                <p className="text-sm font-bold text-white">{pref.label}</p>
                <p className="text-xs text-[#8b9bb4] mt-1">{pref.desc}</p>
              </div>
              <button
                onClick={() => setSettings({ ...settings, [pref.key]: !settings[pref.key] })}
                className={`relative w-12 h-6 rounded-full transition-colors duration-200 flex-shrink-0 mt-0.5 ${settings[pref.key] ? "bg-indigo-600" : "bg-[#2D3748]"}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${settings[pref.key] ? "translate-x-7" : "translate-x-1"}`} />
              </button>
            </div>
          ))}

          <div className="flex justify-end">
            <button onClick={handleSave} disabled={!isDirty || isSaving}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-500 transition-all disabled:opacity-50">
              {isSaving ? <Spinner size="sm" /> : <Save size={14} />} Save Settings
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
