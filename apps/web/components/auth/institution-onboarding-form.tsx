'use client';

import { Building2, Hash, School2, UserRound, Mail, Lock, CheckCircle2, Upload } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { apiRequest } from '#api';
import { getSupabaseBrowserClient } from '../../lib/supabase-browser';
import { AuthShell } from './auth-shell';
import { env } from '../../lib/env';

type SessionState = {
  accessToken: string;
  email?: string;
};

const ROLES = [
  {
    id: 'institution_admin',
    name: 'Institution Admin',
    description: 'Full platform access and user management'
  },
  {
    id: 'academic_head',
    name: 'Academic Head',
    description: 'Department and school management'
  },
  {
    id: 'faculty',
    name: 'Faculty',
    description: 'Create and manage exam papers'
  },
  {
    id: 'reviewer',
    name: 'Reviewer',
    description: 'Approve papers before publishing'
  }
];

function calculatePasswordStrength(password: string): { score: number; label: string; color: string } {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  if (score <= 2) return { score, label: 'Weak', color: 'bg-red-500' };
  if (score <= 4) return { score, label: 'Fair', color: 'bg-amber-500' };
  if (score <= 5) return { score, label: 'Good', color: 'bg-blue-500' };
  return { score, label: 'Strong', color: 'bg-green-500' };
}

export function InstitutionOnboardingForm() {
  const router = useRouter();

  // Session state
  const [sessionState, setSessionState] = useState<SessionState | null>(
    env.demoMode
      ? {
        accessToken: 'demo_prestige_token',
        email: 'prestige_admin@demo.examcraft'
      }
      : null
  );
  const [isLoadingSession, setIsLoadingSession] = useState(!env.demoMode);

  // Step tracking
  const [currentStep, setCurrentStep] = useState(1);

  // Form state
  const [institutionName, setInstitutionName] = useState('');
  const [institutionSlug, setInstitutionSlug] = useState('');
  const [institutionType, setInstitutionType] = useState('college');
  const [adminDisplayName, setAdminDisplayName] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminPasswordConfirm, setAdminPasswordConfirm] = useState('');
  const [enabledRoles, setEnabledRoles] = useState<string[]>(['institution_admin']);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(calculatePasswordStrength(''));

  // Load session
  useEffect(() => {
    let isMounted = true;

    async function loadSession() {
      if (env.demoMode) {
        setSessionState({
          accessToken: 'demo_prestige_token',
          email: 'prestige_admin@demo.examcraft'
        });
        setAdminDisplayName('Prestige Admin');
        setIsLoadingSession(false);
        return;
      }

      try {
        const supabase = getSupabaseBrowserClient();
        const {
          data: { session }
        } = await supabase.auth.getSession();

        if (!isMounted) return;

        if (session?.access_token && session.user) {
          setSessionState({
            accessToken: session.access_token,
            email: session.user.email
          });
          setAdminDisplayName(
            typeof session.user.user_metadata?.display_name === 'string'
              ? session.user.user_metadata.display_name
              : ''
          );
        }
      } catch (error) {
        console.warn('Session synchronization failed');
      } finally {
        if (isMounted) setIsLoadingSession(false);
      }
    }

    void loadSession();

    return () => {
      isMounted = false;
    };
  }, []);

  // Auto-generate slug from institution name
  const handleInstitutionNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setInstitutionName(name);
    setInstitutionSlug(name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''));
  };

  // Handle password change with strength indicator
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const pwd = e.target.value;
    setAdminPassword(pwd);
    setPasswordStrength(calculatePasswordStrength(pwd));
  };

  // Toggle role selection
  const toggleRole = (roleId: string) => {
    if (roleId === 'institution_admin') return; // Always required
    setEnabledRoles(prev =>
      prev.includes(roleId) ? prev.filter(r => r !== roleId) : [...prev, roleId]
    );
  };

  // Validation for each step
  const isStep1Valid = institutionName.trim() && institutionSlug.trim() && institutionType;
  const isStep2Valid =
    adminDisplayName.trim() &&
    adminPassword.length >= 8 &&
    adminPassword === adminPasswordConfirm &&
    passwordStrength.score >= 3;
  const isStep3Valid = enabledRoles.length > 0;
  const isStep4Valid = true; // Optional step

  const canProceed = () => {
    if (currentStep === 1) return isStep1Valid;
    if (currentStep === 2) return isStep2Valid;
    if (currentStep === 3) return isStep3Valid;
    if (currentStep === 4) return isStep4Valid;
    return true;
  };

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!sessionState) {
      toast.error('Please sign in first before creating an institution.');
      return;
    }

    if (!canProceed()) {
      toast.error('Please complete all required fields.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await apiRequest<{
        institution: { id: string; name: string; slug: string };
        subscriptionPlan: string;
      }>('/onboarding/institution', {
        method: 'POST',
        accessToken: sessionState.accessToken,
        body: JSON.stringify({
          institutionName,
          institutionSlug,
          institutionType,
          adminDisplayName,
          adminPassword,
          enabledRoles,
          primaryContactEmail: sessionState.email
        })
      });

      toast.success(
        `Institution "${response.institution.name}" created successfully on the ${response.subscriptionPlan} plan.`
      );

      setCurrentStep(5); // Move to confirmation step
      setTimeout(() => {
        router.push(`/dashboard?institutionId=${encodeURIComponent(response.institution.id)}`);
      }, 2000);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create institution.');
      setIsSubmitting(false);
    }
  }

  if (isLoadingSession) {
    return (
      <AuthShell
        eyebrow="Onboarding"
        title="Setting up your institution"
        subtitle="Please wait..."
        brandTitle={
          <>
            Set up your
            <br />
            <span>institution workspace.</span>
          </>
        }
        brandSubtitle="Establish your institution's command center to unlock automated paper generation, faculty coordination, and pedagogical repository management."
        features={[
          'Isolated multi-tenant sharding',
          'Pedagogical repository structure',
          'Role-based access hierarchy',
          'Institutional grade audit trails'
        ]}
      >
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </AuthShell>
    );
  }

  if (!sessionState) {
    return (
      <AuthShell
        eyebrow="Onboarding"
        title="Create your institution"
        subtitle="Sign in first so onboarding can attach the new tenant to your account."
        brandTitle={
          <>
            Set up your
            <br />
            <span>institution workspace.</span>
          </>
        }
        brandSubtitle="Establish your institution's command center to unlock automated paper generation, faculty coordination, and pedagogical repository management."
        features={[
          'Isolated multi-tenant sharding',
          'Pedagogical repository structure',
          'Role-based access hierarchy',
          'Institutional grade audit trails'
        ]}
      >
        <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-yellow-600 text-sm">
          Please sign in first to proceed with institution setup.
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      eyebrow="Onboarding"
      title={
        currentStep === 5
          ? 'Institution setup complete!'
          : currentStep === 1
            ? 'Institution Details'
            : currentStep === 2
              ? 'Admin Account'
              : currentStep === 3
                ? 'Configure Roles'
                : 'Import Data'
      }
      subtitle={
        currentStep === 5
          ? 'Your institution workspace is ready'
          : `Step ${currentStep} of 4`
      }
      brandTitle={
        <>
          Set up your
          <br />
          <span>institution workspace.</span>
        </>
      }
      brandSubtitle="Establish your institution's command center to unlock automated paper generation, faculty coordination, and pedagogical repository management."
      features={[
        'Isolated multi-tenant sharding',
        'Pedagogical repository structure',
        'Role-based access hierarchy',
        'Institutional grade audit trails'
      ]}
    >
      {/* Progress Bar */}
      {currentStep < 5 && (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm text-gray-400">Step {currentStep} of 4</span>
            <span className="text-sm text-gray-400">{Math.round((currentStep / 4) * 100)}%</span>
          </div>
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
              style={{ width: `${(currentStep / 4) * 100}%` }}
            ></div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* STEP 1: Institution Details */}
        {currentStep === 1 && (
          <div className="space-y-4 animate-fadeIn">
            <div>
              <label className="block text-sm font-medium text-white mb-2">Official Institution Name</label>
              <div className="relative">
                <Building2 className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
                <input
                  type="text"
                  value={institutionName}
                  onChange={handleInstitutionNameChange}
                  placeholder="Ex: National Institute of Technology"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-800/60 border border-white/20 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all duration-200"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">Unique Institutional Slug</label>
              <div className="relative">
                <Hash className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
                <input
                  type="text"
                  value={institutionSlug}
                  onChange={(e) => setInstitutionSlug(e.target.value.toLowerCase())}
                  placeholder="example-college"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-800/60 border border-white/20 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all duration-200"
                  required
                />
              </div>
              <p className="text-xs text-gray-500 mt-1 pl-1">Your dedicated sub-path for direct access.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">Institution Type</label>
              <div className="relative">
                <School2 className="absolute left-3 top-3 h-5 w-5 text-gray-500 pointer-events-none" />
                <select
                  value={institutionType}
                  onChange={(e) => setInstitutionType(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-800/60 border border-white/20 rounded-xl text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all duration-200 appearance-none"
                  required
                >
                  <option value="university">University</option>
                  <option value="college">College</option>
                  <option value="school">School</option>
                  <option value="coaching">Coaching Center</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">Primary Contact Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
                <input
                  type="email"
                  value={sessionState?.email || ''}
                  disabled
                  className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-gray-400 placeholder:text-gray-500 cursor-not-allowed opacity-60"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1 pl-1">Pre-filled from your account</p>
            </div>
          </div>
        )}

        {/* STEP 2: Admin Account */}
        {currentStep === 2 && (
          <div className="space-y-4 animate-fadeIn">
            <div>
              <label className="block text-sm font-medium text-white mb-2">Admin Display Name</label>
              <div className="relative">
                <UserRound className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
                <input
                  type="text"
                  value={adminDisplayName}
                  onChange={(e) => setAdminDisplayName(e.target.value)}
                  placeholder="Academic Coordinator"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-800/60 border border-white/20 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all duration-200"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">Admin Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
                <input
                  type="email"
                  value={sessionState?.email || ''}
                  disabled
                  className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-gray-400 placeholder:text-gray-500 cursor-not-allowed opacity-60"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1 pl-1">Pre-filled from your account</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
                <input
                  type="password"
                  value={adminPassword}
                  onChange={handlePasswordChange}
                  placeholder="Enter a strong password"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-800/60 border border-white/20 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all duration-200"
                  required
                />
              </div>
              {adminPassword && (
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-400">Password strength</span>
                    <span className={`text-xs font-medium ${passwordStrength.label === 'Weak' ? 'text-red-500' :
                        passwordStrength.label === 'Fair' ? 'text-amber-500' :
                          passwordStrength.label === 'Good' ? 'text-blue-500' :
                            'text-green-500'
                      }`}>
                      {passwordStrength.label}
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${passwordStrength.color} transition-all`}
                      style={{ width: `${(passwordStrength.score / 6) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
                <input
                  type="password"
                  value={adminPasswordConfirm}
                  onChange={(e) => setAdminPasswordConfirm(e.target.value)}
                  placeholder="Confirm your password"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-800/60 border border-white/20 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all duration-200"
                  required
                />
              </div>
              {adminPasswordConfirm && adminPassword !== adminPasswordConfirm && (
                <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
              )}
            </div>
          </div>
        )}

        {/* STEP 3: Configure Roles */}
        {currentStep === 3 && (
          <div className="space-y-4 animate-fadeIn">
            <p className="text-gray-400 text-sm">Choose which roles your institution needs</p>
            <div className="space-y-3">
              {ROLES.map((role) => (
                <label
                  key={role.id}
                  className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition ${enabledRoles.includes(role.id)
                      ? 'border-blue-500/50 bg-blue-500/10'
                      : 'border-white/10 bg-white/5 hover:border-white/20'
                    } ${role.id === 'institution_admin' ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={enabledRoles.includes(role.id)}
                    onChange={() => toggleRole(role.id)}
                    disabled={role.id === 'institution_admin'}
                    className="mt-1 w-4 h-4 rounded cursor-pointer"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-white">{role.name}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{role.description}</div>
                    {role.id === 'institution_admin' && (
                      <div className="text-xs text-blue-400 mt-1">Always enabled</div>
                    )}
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* STEP 4: Import Data */}
        {currentStep === 4 && (
          <div className="space-y-4 animate-fadeIn">
            <p className="text-gray-400 text-sm">Import your question bank (optional)</p>

            <div className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center hover:border-white/30 transition cursor-pointer bg-white/5">
              <Upload className="h-8 w-8 mx-auto mb-3 text-gray-400" />
              <p className="text-white font-medium mb-1">Upload CSV file</p>
              <p className="text-xs text-gray-400 mb-4">Drag and drop or click to select</p>
              <input
                type="file"
                accept=".csv"
                onChange={(e) => setUploadedFile(e.target.files?.[0] || null)}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="inline-block px-4 py-2 rounded-lg border border-white/20 text-sm font-medium text-white hover:border-white/40 hover:bg-white/5 transition cursor-pointer"
              >
                Select File
              </label>
            </div>

            {uploadedFile && (
              <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-sm flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                {uploadedFile.name} ready to upload
              </div>
            )}

            <button
              type="button"
              onClick={() => setUploadedFile(null)}
              className="text-sm text-gray-400 hover:text-white transition"
            >
              Skip and continue
            </button>
          </div>
        )}

        {/* STEP 5: Confirmation */}
        {currentStep === 5 && (
          <div className="space-y-6 animate-fadeIn text-center py-8">
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-xl opacity-50"></div>
                <div className="relative w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                  <CheckCircle2 className="h-10 w-10 text-white" />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-white mb-2">Institution setup complete!</h3>
              <p className="text-gray-400">Your institution workspace is ready to use</p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-lg p-4 text-left space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Institution Name</span>
                <span className="text-white font-medium">{institutionName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Institution Slug</span>
                <span className="text-white font-medium">{institutionSlug}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Enabled Roles</span>
                <span className="text-white font-medium">{enabledRoles.length} role(s)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Admin Email</span>
                <span className="text-white font-medium">{sessionState?.email}</span>
              </div>
            </div>

            <div className="pt-4 space-y-3">
              <button
                type="button"
                onClick={() => router.push('/dashboard')}
                className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition"
              >
                Go to Dashboard
              </button>
              <button
                type="button"
                onClick={() => router.push('/team')}
                className="w-full px-6 py-3 border border-white/20 hover:border-white/40 text-white font-semibold rounded-lg transition"
              >
                Invite Team Members
              </button>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        {currentStep < 5 && (
          <div className="flex gap-3 pt-6 border-t border-white/10">
            <button
              type="button"
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
              className="flex-1 px-6 py-2.5 border border-white/20 text-white font-medium rounded-lg hover:border-white/40 hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Previous
            </button>

            {currentStep < 4 ? (
              <button
                type="button"
                onClick={() => setCurrentStep(currentStep + 1)}
                disabled={!canProceed()}
                className="flex-1 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                disabled={!canProceed() || isSubmitting}
                className="flex-1 px-6 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {isSubmitting ? 'Creating institution...' : 'Complete Onboarding'}
              </button>
            )}
          </div>
        )}
      </form>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </AuthShell>
  );
}