"use client";

import { BookOpen, Calendar, BarChart3 } from "lucide-react";

interface AcademicConfigProps {
  data: {
    numDepartments: number;
    examinationPattern: string;
    gradingSystem: string;
    academicYearStart: string;
  };
  onChange: (field: string, value: string | number) => void;
}

export function AcademicConfig({ data, onChange }: AcademicConfigProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white mb-1">Set up your academic structure</h2>
        <p className="text-sm text-slate-400">Configure how your institution operates</p>
      </div>

      <div className="space-y-4">
        {/* Number of Departments */}
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-2">Number of Departments *</label>
          <div className="relative">
            <BookOpen className="absolute left-4 top-3.5 h-5 w-5 text-slate-500" />
            <input
              type="number"
              min="1"
              max="50"
              value={data.numDepartments}
              onChange={(e) => onChange("numDepartments", parseInt(e.target.value) || 1)}
              className="w-full bg-slate-800/60 border border-white/20 rounded-xl px-4 py-3 pl-12 text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all"
            />
          </div>
          <p className="text-xs text-slate-500 mt-1">You can add or modify departments later</p>
        </div>

        {/* Examination Pattern */}
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-2">Primary Examination Pattern *</label>
          <select
            value={data.examinationPattern}
            onChange={(e) => onChange("examinationPattern", e.target.value)}
            className="w-full bg-slate-800/60 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all appearance-none"
          >
            <option value="">Select pattern...</option>
            <option value="semester">Semester</option>
            <option value="annual">Annual</option>
            <option value="term_based">Term-based</option>
            <option value="unit_test">Unit Test Series</option>
          </select>
        </div>

        {/* Grading System */}
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-2">Grading System *</label>
          <select
            value={data.gradingSystem}
            onChange={(e) => onChange("gradingSystem", e.target.value)}
            className="w-full bg-slate-800/60 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all appearance-none"
          >
            <option value="">Select grading system...</option>
            <option value="marks">Marks-based</option>
            <option value="grade">Grade-based</option>
            <option value="cgpa">CGPA</option>
            <option value="percentage">Percentage</option>
          </select>
        </div>

        {/* Academic Year Start Month */}
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-2">Academic Year Start Month *</label>
          <div className="relative">
            <Calendar className="absolute left-4 top-3.5 h-5 w-5 text-slate-500" />
            <select
              value={data.academicYearStart}
              onChange={(e) => onChange("academicYearStart", e.target.value)}
              className="w-full bg-slate-800/60 border border-white/20 rounded-xl px-4 py-3 pl-12 text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all appearance-none"
            >
              <option value="">Select month...</option>
              <option value="april">April</option>
              <option value="june">June</option>
              <option value="july">July</option>
              <option value="january">January</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
