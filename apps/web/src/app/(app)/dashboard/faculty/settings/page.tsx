"use client";

import { useEffect, useState } from "react";
import {
  Settings,
  Save,
  RotateCcw,
  User,
  Bell,
  FileText,
  Building2,
  CheckCircle,
  Palette,
} from "lucide-react";
import { useInstitution } from "@/hooks/use-institution";
import { getSupabaseBrowserSession } from "@/lib/supabase-browser";
import { Spinner } from "@examcraft/ui";

type FacultyPreferences = {
  defaultQuestionType: string;
  defaultDifficulty: string;
  defaultBloomLevel: string;
  defaultMarks: number;
  notifyOnApproval: boolean;
  notifyOnRejection: boolean;
  compactQuestionView: boolean;
  autoSaveDrafts: boolean;
};

const defaultPrefs: FacultyPreferences = {
  defaultQuestionType: "descriptive",
  defaultDifficulty: "Medium",
  defaultBloomLevel: "Understand",
  defaultMarks: 5,
  notifyOnApproval: true,
  notifyOnRejection: true,
  compactQuestionView: false,
  autoSaveDrafts: true,
};

const TABS = [
  { id: "profile", label: "Profile", icon: User },
  { id: "preferences", label: "Preferences", icon: Palette },
  { id: "notifications", label: "Notifications", icon: Bell },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function FacultySettingsPage() {
  const { institutionName, isLoading: instLoading } = useInstitution();
  const [activeTab, setActiveTab] = useState<TabId>("profile");
  const [prefs, setPrefs] = useState<FacultyPreferences>(defaultPrefs);
  const [savedPrefs, setSavedPrefs] = useState<FacultyPreferences>(defaultPrefs);
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<{
    type: "success" | "error";
    msg: string;
  } | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadProfile() {
      try {
        const session = await getSupabaseBrowserSession();
        if (!session || !mounted) return;

        setUserEmail(session.user.email || "");

        const userMetadata = session.user.user_metadata || {};
        const displayName =
          typeof userMetadata.name === "string"
            ? userMetadata.name
            : typeof userMetadata.full_name === "string"
              ? userMetadata.full_name
              : undefined;

        setUserName(displayName || session.user.email?.split("@")[0] || "");

        const savedKey = session.user.id
          ? `examcraft_faculty_prefs_${session.user.id}`
          : null;
        const saved = savedKey ? localStorage.getItem(savedKey) : null;

        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            const merged = { ...defaultPrefs, ...parsed };
            setPrefs(merged);
            setSavedPrefs(merged);
          } catch {
            // Ignore invalid local cache and fall back to defaults.
          }
        }
      } catch (error) {
        console.error("Failed to load profile", error);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    void loadProfile();
    return () => {
      mounted = false;
    };
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setStatus(null);

    try {
      const session = await getSupabaseBrowserSession();
      if (session?.user?.id) {
        const savedKey = `examcraft_faculty_prefs_${session.user.id}`;
        localStorage.setItem(savedKey, JSON.stringify(prefs));
      }

      setSavedPrefs(prefs);
      setStatus({ type: "success", msg: "Preferences saved successfully." });
      setTimeout(() => setStatus(null), 3000);
    } catch {
      setStatus({ type: "error", msg: "Failed to save preferences." });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setPrefs(savedPrefs);
    setStatus(null);
  };

  const isDirty = JSON.stringify(prefs) !== JSON.stringify(savedPrefs);

  if (isLoading || instLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" className="w-12 h-12" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 pb-10 max-w-3xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-500/10 border border-slate-500/20 flex items-center justify-center text-slate-400">
            <Settings size={20} />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white">
              Settings
            </h1>
            <p className="text-[#8b9bb4] text-sm font-medium">
              Manage your profile and workflow preferences
            </p>
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
            Save Changes
          </button>
        </div>
      </div>

      <div className="flex gap-1 bg-[#1e293b] p-1.5 rounded-xl w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-bold transition-all ${
              activeTab === tab.id
                ? "bg-[#544bc3] text-white shadow"
                : "text-[#8b9bb4] hover:text-white"
            }`}
          >
            <tab.icon size={15} /> {tab.label}
          </button>
        ))}
      </div>

      {status && (
        <div
          className={`px-5 py-3 rounded-xl text-sm font-medium flex items-center gap-2 ${
            status.type === "success"
              ? "bg-green-500/10 text-green-400 border border-green-500/20"
              : "bg-red-500/10 text-red-400 border border-red-500/20"
          }`}
        >
          <span className="font-black uppercase tracking-wide">
            {status.type === "success" ? "Success" : "Error"}
          </span>
          <span>{status.msg}</span>
        </div>
      )}

      {activeTab === "profile" && (
        <div className="bg-[#1e293b] border border-white/5 rounded-2xl p-8 flex flex-col gap-6">
          <div className="flex items-center gap-2 mb-2">
            <User size={16} className="text-[#8b9bb4]" />
            <h2 className="text-[13px] font-black text-white uppercase tracking-widest">
              Your Profile
            </h2>
          </div>

          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-2xl font-black shadow-xl">
              {userName
                .split(" ")
                .map((name) => name[0])
                .join("")
                .toUpperCase()
                .slice(0, 2) || "?"}
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-lg font-bold text-white">
                {userName || "Faculty User"}
              </span>
              <span className="text-sm text-[#8b9bb4]">{userEmail}</span>
            </div>
          </div>

          <div className="mt-2 p-5 rounded-xl bg-[#0f172a] border border-white/5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
              <Building2 size={18} className="text-indigo-400" />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#8b9bb4]">
                Institution
              </span>
              <span className="text-sm font-bold text-white">
                {institutionName || "Loading..."}
              </span>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-[#0f172a] border border-white/5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center flex-shrink-0">
              <CheckCircle size={18} className="text-violet-400" />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#8b9bb4]">
                Role
              </span>
              <span className="text-sm font-bold text-white">Faculty</span>
            </div>
          </div>

          <p className="text-xs text-[#8b9bb4] mt-2">
            Contact your institution admin to update your profile details or
            role.
          </p>
        </div>
      )}

      {activeTab === "preferences" && (
        <div className="bg-[#1e293b] border border-white/5 rounded-2xl p-8 flex flex-col gap-6">
          <div className="flex items-center gap-2 mb-2">
            <FileText size={16} className="text-[#8b9bb4]" />
            <h2 className="text-[13px] font-black text-white uppercase tracking-widest">
              Default Question Settings
            </h2>
          </div>
          <p className="text-xs text-[#8b9bb4] -mt-3">
            These defaults pre-fill forms when creating new questions.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#8b9bb4]">
                Default Question Type
              </label>
              <select
                value={prefs.defaultQuestionType}
                onChange={(e) =>
                  setPrefs({ ...prefs, defaultQuestionType: e.target.value })
                }
                className="bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 appearance-none"
              >
                <option value="descriptive">Descriptive</option>
                <option value="mcq">Multiple Choice (MCQ)</option>
                <option value="short_answer">Short Answer</option>
                <option value="numerical">Numerical</option>
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#8b9bb4]">
                Default Difficulty
              </label>
              <select
                value={prefs.defaultDifficulty}
                onChange={(e) =>
                  setPrefs({ ...prefs, defaultDifficulty: e.target.value })
                }
                className="bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 appearance-none"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#8b9bb4]">
                Default Bloom&apos;s Level
              </label>
              <select
                value={prefs.defaultBloomLevel}
                onChange={(e) =>
                  setPrefs({ ...prefs, defaultBloomLevel: e.target.value })
                }
                className="bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 appearance-none"
              >
                <option value="Remember">Remember</option>
                <option value="Understand">Understand</option>
                <option value="Apply">Apply</option>
                <option value="Analyze">Analyze</option>
                <option value="Evaluate">Evaluate</option>
                <option value="Create">Create</option>
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#8b9bb4]">
                Default Marks per Question
              </label>
              <input
                type="number"
                min={1}
                max={50}
                value={prefs.defaultMarks}
                onChange={(e) =>
                  setPrefs({
                    ...prefs,
                    defaultMarks: Math.max(1, Number(e.target.value)),
                  })
                }
                className="bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 mt-2">
            {[
              {
                key: "compactQuestionView" as const,
                label: "Compact Question View",
                desc: "Display questions in a condensed layout in the question bank.",
              },
              {
                key: "autoSaveDrafts" as const,
                label: "Auto-Save Drafts",
                desc: "Automatically save question and paper drafts as you type.",
              },
            ].map((toggle) => (
              <div
                key={toggle.key}
                className="flex items-start justify-between gap-6 p-5 rounded-xl bg-[#0f172a] border border-white/5"
              >
                <div>
                  <p className="text-sm font-bold text-white">{toggle.label}</p>
                  <p className="text-xs text-[#8b9bb4] mt-1">{toggle.desc}</p>
                </div>
                <button
                  onClick={() =>
                    setPrefs({ ...prefs, [toggle.key]: !prefs[toggle.key] })
                  }
                  className={`relative w-12 h-6 rounded-full transition-colors duration-200 flex-shrink-0 mt-0.5 ${
                    prefs[toggle.key] ? "bg-indigo-600" : "bg-[#2D3748]"
                  }`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${
                      prefs[toggle.key] ? "translate-x-7" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>

          {isDirty && (
            <p className="text-xs text-yellow-400 flex items-center gap-2">
              Unsaved changes remain until you click{" "}
              <strong>Save Changes</strong>
            </p>
          )}
        </div>
      )}

      {activeTab === "notifications" && (
        <div className="bg-[#1e293b] border border-white/5 rounded-2xl p-8 flex flex-col gap-6">
          <div className="flex items-center gap-2 mb-2">
            <Bell size={16} className="text-[#8b9bb4]" />
            <h2 className="text-[13px] font-black text-white uppercase tracking-widest">
              Notification Preferences
            </h2>
          </div>
          <p className="text-xs text-[#8b9bb4] -mt-3">
            Control which notifications you receive.
          </p>

          <div className="flex flex-col gap-3">
            {[
              {
                key: "notifyOnApproval" as const,
                label: "Paper Approved",
                desc: "Receive a notification when your submitted paper is approved.",
              },
              {
                key: "notifyOnRejection" as const,
                label: "Paper Rejected",
                desc: "Receive a notification when your submitted paper is rejected with feedback.",
              },
            ].map((notification) => (
              <div
                key={notification.key}
                className="flex items-start justify-between gap-6 p-5 rounded-xl bg-[#0f172a] border border-white/5"
              >
                <div>
                  <p className="text-sm font-bold text-white">
                    {notification.label}
                  </p>
                  <p className="text-xs text-[#8b9bb4] mt-1">
                    {notification.desc}
                  </p>
                </div>
                <button
                  onClick={() =>
                    setPrefs({
                      ...prefs,
                      [notification.key]: !prefs[notification.key],
                    })
                  }
                  className={`relative w-12 h-6 rounded-full transition-colors duration-200 flex-shrink-0 mt-0.5 ${
                    prefs[notification.key] ? "bg-indigo-600" : "bg-[#2D3748]"
                  }`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${
                      prefs[notification.key]
                        ? "translate-x-7"
                        : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>

          {isDirty && (
            <p className="text-xs text-yellow-400 flex items-center gap-2">
              Unsaved changes remain until you click{" "}
              <strong>Save Changes</strong>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
