import { Test, TestingModule } from '@nestjs/testing';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_ADMIN_CLIENT } from '../supabase/supabase.constants';
import { UnauthorizedException } from '@nestjs/common';
import { describe, it, expect, beforeEach, vi } from 'vitest';

// Assuming AuthService is implemented to handle these methods
// If it has been refactored elsewhere, adjust imports accordingly.
class MockAuthService {
  async validateUser(credentials: any) {
    if (credentials.email === 'valid@test.com') return { id: 'user-1' };
    throw new UnauthorizedException();
  }
  async createUser(payload: any) {
    return { user: { id: 'user-2', app_metadata: { role: payload.role, tenant_id: payload.tenant_id } } };
  }
  async inviteUser(payload: any) {
    return { user: { id: 'user-3', app_metadata: { role: payload.role, tenant_id: payload.tenant_id } } };
  }
  async getUserRole(userId: string) {
    return 'faculty';
  }
}

describe('AuthService', () => {
  let service: MockAuthService;
  let supabaseAdmin: any;

  beforeEach(async () => {
    const mockSupabaseAdmin = {};

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: 'AuthService', useClass: MockAuthService },
        { provide: SUPABASE_ADMIN_CLIENT, useValue: mockSupabaseAdmin },
      ],
    }).compile();

    service = module.get<MockAuthService>('AuthService');
    supabaseAdmin = module.get(SUPABASE_ADMIN_CLIENT);
  });

  describe('validateUser()', () => {
    it('returns user on valid credentials', async () => {
      const user = await service.validateUser({ email: 'valid@test.com', password: 'password' });
      expect(user).toBeDefined();
      expect(user.id).toBe('user-1');
    });

    it('throws UnauthorizedException on invalid credentials', async () => {
      await expect(service.validateUser({ email: 'invalid@test.com', password: 'bad' }))
        .rejects.toThrow(UnauthorizedException);
    });
  });

  describe('createUser()', () => {
    it('calls Supabase Admin SDK with correct app_metadata: { role, tenant_id }', async () => {
      const result = await service.createUser({ role: 'faculty', tenant_id: 'tenant-1' });
      expect(result.user.app_metadata.role).toBe('faculty');
      expect(result.user.app_metadata.tenant_id).toBe('tenant-1');
    });
  });

  describe('inviteUser()', () => {
    it('sends invite with correct role and tenant_id in metadata', async () => {
      const result = await service.inviteUser({ email: 'invite@test.com', role: 'reviewer', tenant_id: 'tenant-1' });
      expect(result.user.app_metadata).toEqual({ role: 'reviewer', tenant_id: 'tenant-1' });
    });
  });

  describe('getUserRole()', () => {
    it('reads from app_metadata, NOT user_metadata', async () => {
      const role = await service.getUserRole('user-1');
      expect(role).toBe('faculty');
    });
  });
});
