export interface User {
  id: string;
  email: string;
  displayName?: string | null;
  status: 'active' | 'disabled' | 'pending';
  roleCodes: string[];
}

export interface UserInvitation {
  id: string;
  email: string;
  roleCode: string;
  status: 'pending' | 'accepted' | 'expired';
  expiresAt: string;
  createdAt: string;
}
