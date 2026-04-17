import { SetMetadata } from '@nestjs/common';
import { AuditAction } from '../../audit-logs/audit-action.enum';

export const AUDIT_LOG_KEY = 'audit_log';

export interface AuditLogMetadata {
  action: AuditAction;
  resourceType: string;
  extractResourceId?: (result: any, args: any[]) => string;
  extractMetadata?: (result: any, args: any[]) => Record<string, any>;
}

export const AuditLog = (
  action: AuditAction,
  resourceType: string,
  extractResourceId?: (result: any, args: any[]) => string,
  extractMetadata?: (result: any, args: any[]) => Record<string, any>,
) => SetMetadata(AUDIT_LOG_KEY, { action, resourceType, extractResourceId, extractMetadata });
