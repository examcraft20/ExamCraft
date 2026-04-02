export interface CreateInvitationDto {
  institutionId: string;
  email: string;
  roleCode: "institution_admin" | "academic_head" | "faculty" | "reviewer_approver";
  expiresInDays?: number;
}

export interface AcceptInvitationDto {
  token: string;
  password: string;
  displayName?: string;
}
