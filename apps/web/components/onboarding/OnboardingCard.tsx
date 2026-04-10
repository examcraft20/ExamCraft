"use client";

import { Building2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";
import { apiRequest } from "#api";
import { getSupabaseBrowserClient } from "../../lib/supabase-browser";
import { env } from "../../lib/env";
import { StepIndicator } from "./StepIndicator";
import { InstitutionDetails } from "./steps/InstitutionDetails";
import { AcademicConfig } from "./steps/AcademicConfig";
import { InviteTeam } from "./steps/InviteTeam";

type SessionState = {
  accessToken: string;
  email?: string;
};

type FormData = {
  // Step 1
  institutionName: string;
  institutionType: string;
  city: string;
  state: string;
  country: string;
  website: string;
  // Step 2
  departments: number;
  examinationPattern: string;
  gradingSystem: string;
  academicYearStart: string;
  // Step 3
  teamMembers: Array<{ email: string; role: string }>;
};

export function OnboardingCard() {
  const router = useRouter();

  // Session state
  const [sessionState, setSessionState] = useState<SessionState | null>(
    env.demoMode
      ? {
          accessToken: "demo_token",
          email: "admin@demo.examcraft",
        }
      : null,
  );
  const [isLoadingSession, setIsLoadingSession] = useState(!env.demoMode);

  // Step tracking
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Form state
  const [formData, setFormData] = useState<FormData>({
    institutionName: "",
    institutionType: "",
    city: "",
    state: "",
    country: "India",
    website: "",
    departments: 1,
    examinationPattern: "",
    gradingSystem: "",
    academicYearStart: "",
    teamMembers: [],
  });

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load session
  useEffect(() => {
    let isMounted = true;

    async function loadSession() {
      if (env.demoMode) {
        setIsLoadingSession(false);
        return;
      }

      try {
        const supabase = getSupabaseBrowserClient();
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!isMounted) return;

        if (session?.access_token && session.user) {
          setSessionState({
            accessToken: session.access_token,
            email: session.user.email,
          });
        }
      } catch (error) {
        console.warn("Session synchronization failed");
      } finally {
        if (isMounted) setIsLoadingSession(false);
      }
    }

    void loadSession();

    return () => {
      isMounted = false;
    };
  }, []);

  // Validation for each step
  const isStep1Valid =
    formData.institutionName.trim() &&
    formData.institutionType &&
    formData.city.trim() &&
    formData.state.trim();

  const isStep2Valid =
    formData.departments > 0 &&
    formData.examinationPattern &&
    formData.gradingSystem &&
    formData.academicYearStart;

  const handleStep1Submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isStep1Valid) {
      setCurrentStep(2);
    }
  };

  const handleStep2Submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isStep2Valid) {
      setCurrentStep(3);
    }
  };

  const handleStep3Submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!sessionState) {
      toast.error("Please sign in first");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await apiRequest<{
        institution: { id: string; name: string };
      }>("/onboarding/institution", {
        method: "POST",
        accessToken: sessionState.accessToken,
        body: JSON.stringify({
          institutionName: formData.institutionName,
          institutionType: formData.institutionType,
          city: formData.city,
          state: formData.state,
          country: formData.country,
          website: formData.website,
          departments: formData.departments,
          examinationPattern: formData.examinationPattern,
          gradingSystem: formData.gradingSystem,
          academicYearStart: formData.academicYearStart,
          teamMembers: formData.teamMembers,
          primaryContactEmail: sessionState.email,
        }),
      });

      toast.success(
        `Institution "${response.institution.name}" created successfully!`,
      );

      setTimeout(() => {
        router.push(
          `/dashboard?institutionId=${encodeURIComponent(response.institution.id)}`,
        );
      }, 1500);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create institution",
      );
      setIsSubmitting(false);
    }
  };

  const handleFieldChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSkipTeam = async () => {
    // Submit without team members
    await handleStep3Submit({
      preventDefault: () => {},
    } as FormEvent<HTMLFormElement>);
  };

  if (isLoadingSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!sessionState) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
            <p className="text-white text-center">
              Please sign in to proceed with institution setup.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Gradient orbs background */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-2xl w-full relative z-10">
        {/* Logo and title */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-10 h-10 flex items-center justify-center bg-white rounded-lg text-black font-bold">
              <Building2 size={22} strokeWidth={2.5} />
            </div>
            <h1 className="text-2xl font-bold text-white">ExamCraft</h1>
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">
            Institution Setup
          </h2>
          <p className="text-slate-400">Step {currentStep} of 3</p>
        </div>

        {/* Main card */}
        <div className="rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl p-8 shadow-2xl">
          {/* Progress indicator */}
          <div className="mb-8 pb-8 border-b border-white/10">
            <StepIndicator currentStep={currentStep} />
          </div>

          {/* Step content */}
          <div className="mb-8">
            {currentStep === 1 && (
              <>
                <h3 className="text-xl font-semibold text-white mb-6">
                  Tell us about your institution
                </h3>
                <InstitutionDetails
                  data={{
                    institutionName: formData.institutionName,
                    institutionType: formData.institutionType,
                    city: formData.city,
                    state: formData.state,
                    country: formData.country,
                    website: formData.website,
                  }}
                  onChange={handleFieldChange}
                />
              </>
            )}

            {currentStep === 2 && (
              <>
                <h3 className="text-xl font-semibold text-white mb-6">
                  Set up your academic structure
                </h3>
                <AcademicConfig
                  data={{
                    numDepartments: formData.departments,
                    examinationPattern: formData.examinationPattern,
                    gradingSystem: formData.gradingSystem,
                    academicYearStart: formData.academicYearStart,
                  }}
                  onChange={handleFieldChange}
                />
              </>
            )}

            {currentStep === 3 && (
              <>
                <h3 className="text-xl font-semibold text-white mb-6">
                  Invite your core team
                </h3>
                <InviteTeam
                  data={{ invites: formData.teamMembers }}
                  onChange={(members) =>
                    handleFieldChange("teamMembers", members)
                  }
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
