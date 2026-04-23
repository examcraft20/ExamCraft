import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SupabaseAuthGuard } from './guards/supabase-auth.guard';
import { IS_PUBLIC_KEY } from './decorators/public.decorator';


describe('SupabaseAuthGuard (jwt.guard)', () => {
  let guard: SupabaseAuthGuard;
  let reflector: any;
  let mockSupabaseAdmin: any;

  beforeEach(() => {
    reflector = {
      getAllAndOverride: jest.fn(),
    } as any;

    mockSupabaseAdmin = {
      auth: {
        getUser: jest.fn(),
      },
    };

    guard = new SupabaseAuthGuard(mockSupabaseAdmin, reflector as any);
  });

  function createMockContext(authHeader?: string): ExecutionContext {
    return {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => ({
          headers: {
            authorization: authHeader,
          },
        }),
      }),
    } as unknown as ExecutionContext;
  }

  it('Allows @Public() routes through without a token', async () => {
    reflector.getAllAndOverride.mockReturnValue(true);
    const context = createMockContext();
    const result = await guard.canActivate(context);
    expect(result).toBe(true);
  });

  it('Passes valid Supabase JWT — extracts user, role, tenant_id correctly', async () => {
    reflector.getAllAndOverride.mockReturnValue(false);
    const context = createMockContext('Bearer valid-token');
    
    mockSupabaseAdmin.auth.getUser.mockResolvedValue({
      data: {
        user: {
          id: 'user-1',
          email: 'test@example.com',
          app_metadata: { role: 'faculty', tenant_id: 'tenant-1' },
        },
      },
      error: null,
    });

    const result = await guard.canActivate(context);
    expect(result).toBe(true);
    
    const request = context.switchToHttp().getRequest() as any;
    expect(request.currentUser).toBeDefined();
    expect(request.currentUser.id).toBe('user-1');
    expect(request.currentUser.roleCodes).toContain('faculty');
  });

  it('Rejects expired token — throws UnauthorizedException', async () => {
    reflector.getAllAndOverride.mockReturnValue(false);
    const context = createMockContext('Bearer expired-token');
    
    mockSupabaseAdmin.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: new Error('Token expired'),
    });

    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
  });

  it('Rejects tampered token — throws UnauthorizedException', async () => {
    reflector.getAllAndOverride.mockReturnValue(false);
    const context = createMockContext('Bearer tampered-token');
    
    mockSupabaseAdmin.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: new Error('Invalid token signature'),
    });

    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
  });

  it('Rejects missing token — throws UnauthorizedException', async () => {
    reflector.getAllAndOverride.mockReturnValue(false);
    const context = createMockContext();
    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
  });
});
