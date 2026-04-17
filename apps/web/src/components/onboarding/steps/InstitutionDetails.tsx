"use client";

import { Building2, MapPin, Globe } from "lucide-react";

interface InstitutionDetailsProps {
  data: {
    institutionName: string;
    institutionType: string;
    city: string;
    state: string;
    country: string;
    website: string;
  };
  onChange: (field: string, value: string) => void;
}

export function InstitutionDetails({
  data,
  onChange,
}: InstitutionDetailsProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white mb-1">
          Tell us about your institution
        </h2>
        <p className="text-sm text-slate-400">
          This helps us customize your workspace
        </p>
      </div>

      <div className="space-y-4">
        {/* Institution Name */}
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-2">
            Institution Name *
          </label>
          <div className="relative">
            <Building2 className="absolute left-4 top-3.5 h-5 w-5 text-slate-500" />
            <input
              type="text"
              value={data.institutionName}
              onChange={(e) => onChange("institutionName", e.target.value)}
              placeholder="National Institute of Technology"
              className="w-full bg-slate-800/60 border border-white/20 rounded-xl px-4 py-3 pl-12 text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all"
            />
          </div>
        </div>

        {/* Institution Type */}
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-2">
            Institution Type *
          </label>
          <select
            value={data.institutionType}
            onChange={(e) => onChange("institutionType", e.target.value)}
            className="w-full bg-slate-800/60 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all appearance-none"
          >
            <option value="">Select type...</option>
            <option value="college">College</option>
            <option value="school">School</option>
            <option value="university">University</option>
            <option value="tuition_center">Tuition Center</option>
            <option value="coaching">Coaching Institute</option>
          </select>
        </div>

        {/* City */}
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-2">
            City *
          </label>
          <div className="relative">
            <MapPin className="absolute left-4 top-3.5 h-5 w-5 text-slate-500" />
            <input
              type="text"
              value={data.city}
              onChange={(e) => onChange("city", e.target.value)}
              placeholder="Bangalore"
              className="w-full bg-slate-800/60 border border-white/20 rounded-xl px-4 py-3 pl-12 text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all"
            />
          </div>
        </div>

        {/* State */}
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-2">
            State *
          </label>
          <input
            type="text"
            value={data.state}
            onChange={(e) => onChange("state", e.target.value)}
            placeholder="Karnataka"
            className="w-full bg-slate-800/60 border border-white/20 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all"
          />
        </div>

        {/* Country */}
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-2">
            Country *
          </label>
          <select
            value={data.country}
            onChange={(e) => onChange("country", e.target.value)}
            className="w-full bg-slate-800/60 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all appearance-none"
          >
            <option value="india">India</option>
            <option value="usa">USA</option>
            <option value="uk">UK</option>
            <option value="canada">Canada</option>
            <option value="australia">Australia</option>
          </select>
        </div>

        {/* Website */}
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-2">
            Website URL (optional)
          </label>
          <div className="relative">
            <Globe className="absolute left-4 top-3.5 h-5 w-5 text-slate-500" />
            <input
              type="url"
              value={data.website}
              onChange={(e) => onChange("website", e.target.value)}
              placeholder="https://example.edu"
              className="w-full bg-slate-800/60 border border-white/20 rounded-xl px-4 py-3 pl-12 text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
