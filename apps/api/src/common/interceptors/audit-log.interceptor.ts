import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditLogsService } from '../../audit-logs/audit-logs.service';
import { AUDIT_LOG_KEY, AuditLogMetadata } from '../decorators/audit-log.decorator';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(
    private reflector: Reflector,
    private auditLogsService: AuditLogsService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const auditMetadata = this.reflector.get<AuditLogMetadata>(
      AUDIT_LOG_KEY,
      context.getHandler(),
    );

    if (!auditMetadata) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();

    return next.handle().pipe(
      tap(async (result) => {
        try {
          const institutionContext = request.institutionContext;
          const user = request.user;
          const args = context.getArgs(); // Get the arguments passed to the method
          
          if (!institutionContext || !user) {
            return;
          }

          let resourceId = undefined;
          if (auditMetadata.extractResourceId && result) {
            resourceId = auditMetadata.extractResourceId(result, args);
          }

          let metadata = undefined;
          if (auditMetadata.extractMetadata) {
            metadata = auditMetadata.extractMetadata(result, args);
          }

          await this.auditLogsService.createAuditLog({
            institutionId: institutionContext.institutionId,
            userId: user.id,
            action: auditMetadata.action,
            resourceType: auditMetadata.resourceType,
            resourceId,
            metadata,
            ipAddress: request.ip,
            userAgent: request.headers['user-agent'],
          });
        } catch (error) {
          // Swallow any secondary errors in the interceptor so we don't break the response
        }
      }),
    );

  }
}
