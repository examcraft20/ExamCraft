import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { SUPABASE_ADMIN_CLIENT } from '../supabase/supabase.constants';
import {
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InstitutionContext } from '../common/types/authenticated-request';

describe('UsersService', () => {
  let service: UsersService;
  let mockSupabaseClient: any;

  const mockInstitutionContext: InstitutionContext = {
    institutionId: 'inst-1',
    institutionUserId: 'inst-user-1',
    roleCodes: ['institution_admin'],
    permissionCodes: ['users.read', 'users.update'],
  };

  function createQueryBuilder(overrides: any = {}) {
    const qb: any = {
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
      order: jest.fn().mockReturnThis(),
      returns: jest.fn().mockReturnThis(),
    };
    Object.assign(qb, overrides);
    return qb;
  }

  beforeEach(async () => {
    mockSupabaseClient = {
      from: jest.fn().mockReturnValue(createQueryBuilder()),
      auth: {
        admin: {
          deleteUser: jest.fn(),
        },
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: SUPABASE_ADMIN_CLIENT, useValue: mockSupabaseClient },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  describe('getInstitutionUsers', () => {
    it('should return users and invitations mapped correctly', async () => {
      const mockUsers = [
        {
          id: 'iu-1',
          display_name: 'John',
          status: 'active',
          joined_at: '2025-01-01',
          user_id: 'auth-1',
          institution_user_roles: [{ roles: { code: 'faculty' } }],
        },
      ];
      const mockInvitations = [
        {
          id: 'inv-1',
          email: 'new@test.com',
          role_code: 'faculty',
          status: 'pending',
          expires_at: '2025-12-31',
          created_at: '2025-01-01',
        },
      ];

      const usersQB = createQueryBuilder({
        returns: jest.fn().mockResolvedValue({ data: mockUsers, error: null }),
      });
      const invitationsQB = createQueryBuilder({
        returns: jest.fn().mockResolvedValue({ data: mockInvitations, error: null }),
      });

      mockSupabaseClient.from
        .mockReturnValueOnce(usersQB)
        .mockReturnValueOnce(invitationsQB);

      const result = await service.getInstitutionUsers(mockInstitutionContext);
      expect(result.users).toHaveLength(1);
      expect(result.users[0].institutionUserId).toBe('iu-1');
      expect(result.users[0].roleCodes).toEqual(['faculty']);
      expect(result.invitations).toHaveLength(1);
      expect(result.invitations[0].email).toBe('new@test.com');
    });

    it('should throw InternalServerErrorException when query fails', async () => {
      const errorQB = createQueryBuilder({
        returns: jest.fn().mockResolvedValue({ data: null, error: new Error('DB fail') }),
      });
      const okQB = createQueryBuilder({
        returns: jest.fn().mockResolvedValue({ data: [], error: null }),
      });

      mockSupabaseClient.from.mockReturnValueOnce(errorQB).mockReturnValueOnce(okQB);

      await expect(service.getInstitutionUsers(mockInstitutionContext)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('updateUserRole', () => {
    it('should throw NotFoundException when user not found in institution', async () => {
      const userQB = createQueryBuilder({
        single: jest.fn().mockResolvedValue({ data: null, error: new Error('Not found') }),
      });
      mockSupabaseClient.from.mockReturnValue(userQB);

      await expect(
        service.updateUserRole(mockInstitutionContext, 'nonexistent', 'faculty'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for invalid role code', async () => {
      const userQB = createQueryBuilder({
        single: jest.fn().mockResolvedValue({ data: { id: 'iu-1' }, error: null }),
      });
      const roleQB = createQueryBuilder({
        single: jest.fn().mockResolvedValue({ data: null, error: new Error('No role') }),
      });
      mockSupabaseClient.from.mockReturnValueOnce(userQB).mockReturnValueOnce(roleQB);

      await expect(
        service.updateUserRole(mockInstitutionContext, 'iu-1', 'invalid_role'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should update user role successfully', async () => {
      const userQB = createQueryBuilder({
        single: jest.fn().mockResolvedValue({ data: { id: 'iu-1' }, error: null }),
      });
      const roleQB = createQueryBuilder({
        single: jest.fn().mockResolvedValue({ data: { id: 'role-1' }, error: null }),
      });
      const deleteQB = createQueryBuilder();
      const insertQB = createQueryBuilder({
        insert: jest.fn().mockResolvedValue({ error: null }),
      });

      mockSupabaseClient.from
        .mockReturnValueOnce(userQB)
        .mockReturnValueOnce(roleQB)
        .mockReturnValueOnce(deleteQB)
        .mockReturnValueOnce(insertQB);

      const result = await service.updateUserRole(mockInstitutionContext, 'iu-1', 'academic_head');
      expect(result.id).toBe('iu-1');
    });
  });

  describe('updateUser', () => {
    it('should throw NotFoundException when user not found', async () => {
      const qb = createQueryBuilder({
        single: jest.fn().mockResolvedValue({ data: null, error: new Error('Not found') }),
      });
      mockSupabaseClient.from.mockReturnValue(qb);

      await expect(
        service.updateUser(mockInstitutionContext, 'nonexistent', { status: 'active' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for invalid status', async () => {
      const userQB = createQueryBuilder({
        single: jest.fn().mockResolvedValue({ data: { id: 'iu-1' }, error: null }),
      });
      mockSupabaseClient.from.mockReturnValue(userQB);

      await expect(
        service.updateUser(mockInstitutionContext, 'iu-1', { status: 'invalid_status' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when no valid updates provided', async () => {
      const userQB = createQueryBuilder({
        single: jest.fn().mockResolvedValue({ data: { id: 'iu-1' }, error: null }),
      });
      mockSupabaseClient.from.mockReturnValue(userQB);

      await expect(
        service.updateUser(mockInstitutionContext, 'iu-1', {}),
      ).rejects.toThrow(BadRequestException);
    });

    it('should update user status to active', async () => {
      const userQB = createQueryBuilder({
        single: jest.fn().mockResolvedValue({ data: { id: 'iu-1' }, error: null }),
      });
      const updateQB = createQueryBuilder({
        eq: jest.fn().mockReturnThis(),
      });
      const updateResult = {
        eq: jest.fn().mockResolvedValue({ error: null }),
      };
      updateQB.eq = jest.fn().mockReturnValue(updateResult);

      mockSupabaseClient.from.mockReturnValueOnce(userQB).mockReturnValueOnce(updateQB);

      const result = await service.updateUser(mockInstitutionContext, 'iu-1', { status: 'active' });
      expect(result.id).toBe('iu-1');
    });

    it('should update display name', async () => {
      const userQB = createQueryBuilder({
        single: jest.fn().mockResolvedValue({ data: { id: 'iu-1' }, error: null }),
      });
      const updateQB = createQueryBuilder({
        eq: jest.fn().mockReturnThis(),
      });
      const updateResult = {
        eq: jest.fn().mockResolvedValue({ error: null }),
      };
      updateQB.eq = jest.fn().mockReturnValue(updateResult);

      mockSupabaseClient.from.mockReturnValueOnce(userQB).mockReturnValueOnce(updateQB);

      const result = await service.updateUser(mockInstitutionContext, 'iu-1', { displayName: 'New Name' });
      expect(result.id).toBe('iu-1');
    });
  });

  describe('removeUser', () => {
    it('should remove a user from the institution', async () => {
      const deleteQB = createQueryBuilder({
        eq: jest.fn().mockReturnThis(),
      });
      const deleteResult = {
        eq: jest.fn().mockResolvedValue({ error: null }),
      };
      deleteQB.eq = jest.fn().mockReturnValue(deleteResult);

      mockSupabaseClient.from.mockReturnValue(deleteQB);

      const result = await service.removeUser(mockInstitutionContext, 'iu-1');
      expect(result.id).toBe('iu-1');
    });

    it('should throw InternalServerErrorException when deletion fails', async () => {
      const deleteQB = createQueryBuilder({
        eq: jest.fn().mockReturnThis(),
      });
      const deleteResult = {
        eq: jest.fn().mockResolvedValue({ error: new Error('FK violation') }),
      };
      deleteQB.eq = jest.fn().mockReturnValue(deleteResult);

      mockSupabaseClient.from.mockReturnValue(deleteQB);

      await expect(service.removeUser(mockInstitutionContext, 'iu-1')).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('deleteGdprUser', () => {
    it('should call auth.admin.deleteUser', async () => {
      mockSupabaseClient.auth.admin.deleteUser.mockResolvedValue({ error: null });

      await service.deleteGdprUser('user-1');
      expect(mockSupabaseClient.auth.admin.deleteUser).toHaveBeenCalledWith('user-1');
    });

    it('should throw InternalServerErrorException when deletion fails', async () => {
      mockSupabaseClient.auth.admin.deleteUser.mockResolvedValue({
        error: new Error('Cannot delete'),
      });

      await expect(service.deleteGdprUser('user-1')).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
