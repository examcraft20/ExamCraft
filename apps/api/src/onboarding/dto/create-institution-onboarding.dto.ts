export interface CreateInstitutionOnboardingDto {
  institutionName: string;
  institutionSlug: string;
  institutionType: string;
  adminUserId: string;
  adminDisplayName?: string;
  primaryContactEmail?: string;
}
