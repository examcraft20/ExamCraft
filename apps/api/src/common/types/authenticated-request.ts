import type { Request } from "express";

export interface AuthenticatedUser {
  id: string;
  email?: string;
  roleCodes: string[];
  isSuperAdmin: boolean;
}

export interface TenantContext {
  institutionId: string;
  institutionUserId: string;
  roleCodes: string[];
  permissionCodes: string[];
}

export interface AuthenticatedRequest extends Request {
  currentUser?: AuthenticatedUser;
  tenantContext?: TenantContext;
}
