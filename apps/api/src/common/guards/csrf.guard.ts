import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class CsrfGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const isMutation = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method);
    
    if (isMutation) {
      const authHeader = request.headers['authorization'];
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new ForbiddenException('CSRF check failed: Missing or invalid Authorization header for state-mutating request.');
      }
    }
    
    return true;
  }
}
