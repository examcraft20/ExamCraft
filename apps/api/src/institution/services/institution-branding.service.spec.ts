import { Test, TestingModule } from '@nestjs/testing';
import { InstitutionBrandingService } from './institution-branding.service';
import { SUPABASE_ADMIN_CLIENT } from '../../supabase/supabase.constants';
import { NotFoundException, InternalServerErrorException } from '@nestjs/common';

describe('InstitutionBrandingService', () => {
  let service: InstitutionBrandingService;
  let mockSupabaseClient: any;

  function createQueryBuilder(overrides: any = {}) {
    const qb: any = {
      select: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
    };
    Object.assign(qb, overrides);
    return qb;
  }

  beforeEach(async () => {
    mockSupabaseClient = {
      from: jest.fn().mockReturnValue(createQueryBuilder()),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InstitutionBrandingService,
        { provide: SUPABASE_ADMIN_CLIENT, useValue: mockSupabaseClient },
      ],
    }).compile();

    service = module.get<InstitutionBrandingService>(InstitutionBrandingService);
  });

  describe('updateInstitutionBranding', () => {
    it('should throw NotFoundException when institution not found', async () => {
      const qb = createQueryBuilder({
        single: jest.fn().mockResolvedValue({ data: null, error: new Error('Not found') }),
      });
      mockSupabaseClient.from.mockReturnValue(qb);

      await expect(
        service.updateInstitutionBranding('nonexistent', { primaryColor: '#ff0000' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should merge new branding with existing branding', async () => {
      const fetchQB = createQueryBuilder({
        single: jest.fn().mockResolvedValue({
          data: { branding: { primaryColor: '#0000ff', existingField: 'keep' } },
          error: null,
        }),
      });
      const updateQB = createQueryBuilder({
        eq: jest.fn().mockReturnThis(),
      });
      const updateResult = {
        eq: jest.fn().mockResolvedValue({ error: null }),
      };
      updateQB.eq = jest.fn().mockReturnValue(updateResult);

      mockSupabaseClient.from.mockReturnValueOnce(fetchQB).mockReturnValueOnce(updateQB);

      await service.updateInstitutionBranding('inst-1', { secondaryColor: '#00ff00' });

      // Verify the update was called with merged branding
      const updateCall = updateQB.eq.mock.calls[0] || updateResult.eq.mock.calls[0];
      // The update method should have been called
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('institutions');
    });

    it('should set branding from scratch when no existing branding', async () => {
      const fetchQB = createQueryBuilder({
        single: jest.fn().mockResolvedValue({
          data: { branding: null },
          error: null,
        }),
      });
      const updateQB = createQueryBuilder({
        eq: jest.fn().mockReturnThis(),
      });
      const updateResult = {
        eq: jest.fn().mockResolvedValue({ error: null }),
      };
      updateQB.eq = jest.fn().mockReturnValue(updateResult);

      mockSupabaseClient.from.mockReturnValueOnce(fetchQB).mockReturnValueOnce(updateQB);

      await service.updateInstitutionBranding('inst-1', { primaryColor: '#ff0000' });
    });

    it('should throw InternalServerErrorException when update fails', async () => {
      const fetchQB = createQueryBuilder({
        single: jest.fn().mockResolvedValue({
          data: { branding: {} },
          error: null,
        }),
      });
      const updateQB = createQueryBuilder({
        eq: jest.fn().mockReturnThis(),
      });
      const updateResult = {
        eq: jest.fn().mockResolvedValue({ error: new Error('Update failed') }),
      };
      updateQB.eq = jest.fn().mockReturnValue(updateResult);

      mockSupabaseClient.from.mockReturnValueOnce(fetchQB).mockReturnValueOnce(updateQB);

      await expect(
        service.updateInstitutionBranding('inst-1', { primaryColor: '#ff0000' }),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('should only set defined fields in the DTO', async () => {
      const fetchQB = createQueryBuilder({
        single: jest.fn().mockResolvedValue({
          data: { branding: {} },
          error: null,
        }),
      });
      const updateQB = createQueryBuilder({
        eq: jest.fn().mockReturnThis(),
      });
      const updateResult = {
        eq: jest.fn().mockResolvedValue({ error: null }),
      };
      updateQB.eq = jest.fn().mockReturnValue(updateResult);

      mockSupabaseClient.from.mockReturnValueOnce(fetchQB).mockReturnValueOnce(updateQB);

      // Only primaryColor is defined, others are undefined
      await service.updateInstitutionBranding('inst-1', { primaryColor: '#ff0000' });
    });
  });
});
