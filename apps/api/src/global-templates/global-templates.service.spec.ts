import { Test, TestingModule } from '@nestjs/testing';
import { GlobalTemplatesService } from './global-templates.service';
import { SUPABASE_ADMIN_CLIENT } from '../supabase/supabase.constants';
import { InternalServerErrorException, NotFoundException } from '@nestjs/common';

describe('GlobalTemplatesService', () => {
  let service: GlobalTemplatesService;
  let mockSupabaseClient: any;

  function createQueryBuilder(overrides: any = {}) {
    const qb: any = {
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
      order: jest.fn().mockReturnThis(),
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
        GlobalTemplatesService,
        { provide: SUPABASE_ADMIN_CLIENT, useValue: mockSupabaseClient },
      ],
    }).compile();

    service = module.get<GlobalTemplatesService>(GlobalTemplatesService);
  });

  describe('listGlobalTemplates', () => {
    it('should return verified global templates', async () => {
      const mockTemplates = [
        { id: 'gt-1', name: 'Standard Midterm', is_verified: true },
        { id: 'gt-2', name: 'Comprehensive Final', is_verified: true },
      ];
      const qb = createQueryBuilder({
        order: jest.fn().mockResolvedValue({ data: mockTemplates, error: null }),
      });
      mockSupabaseClient.from.mockReturnValue(qb);

      const result = await service.listGlobalTemplates();
      expect(result).toEqual(mockTemplates);
      expect(result).toHaveLength(2);
    });

    it('should throw InternalServerErrorException when query fails', async () => {
      const qb = createQueryBuilder({
        order: jest.fn().mockResolvedValue({ data: null, error: new Error('DB error') }),
      });
      mockSupabaseClient.from.mockReturnValue(qb);

      await expect(service.listGlobalTemplates()).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('cloneTemplate', () => {
    it('should throw NotFoundException when global template not found', async () => {
      const fetchQB = createQueryBuilder({
        single: jest.fn().mockResolvedValue({ data: null, error: new Error('Not found') }),
      });
      mockSupabaseClient.from.mockReturnValue(fetchQB);

      await expect(
        service.cloneTemplate('inst-1', 'user-1', 'nonexistent'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should clone a global template successfully', async () => {
      const globalTemplate = {
        id: 'gt-1',
        name: 'Standard Midterm',
        exam_type: 'internal',
        duration_minutes: 90,
        total_marks: 100,
        sections: [],
      };

      const fetchQB = createQueryBuilder({
        single: jest.fn().mockResolvedValue({ data: globalTemplate, error: null }),
      });
      const insertQB = createQueryBuilder({
        single: jest.fn().mockResolvedValue({
          data: { id: 'new-tpl-1' },
          error: null,
        }),
      });

      mockSupabaseClient.from
        .mockReturnValueOnce(fetchQB)
        .mockReturnValueOnce(insertQB);

      const result = await service.cloneTemplate('inst-1', 'user-1', 'gt-1');
      expect(result.success).toBe(true);
      expect(result.newTemplateId).toBe('new-tpl-1');
    });

    it('should clone template with sections', async () => {
      const globalTemplate = {
        id: 'gt-1',
        name: 'Standard Midterm',
        exam_type: 'internal',
        duration_minutes: 90,
        total_marks: 100,
        sections: [
          { title: 'Section A', question_count: 5, marks_per_question: 10 },
        ],
      };

      const fetchQB = createQueryBuilder({
        single: jest.fn().mockResolvedValue({ data: globalTemplate, error: null }),
      });
      const insertQB = createQueryBuilder({
        single: jest.fn().mockResolvedValue({
          data: { id: 'new-tpl-1' },
          error: null,
        }),
      });
      const sectionQB = createQueryBuilder({
        insert: jest.fn().mockResolvedValue({ error: null }),
      });

      mockSupabaseClient.from
        .mockReturnValueOnce(fetchQB)
        .mockReturnValueOnce(insertQB)
        .mockReturnValueOnce(sectionQB);

      const result = await service.cloneTemplate('inst-1', 'user-1', 'gt-1');
      expect(result.success).toBe(true);
    });

    it('should rollback and throw when section insert fails', async () => {
      const globalTemplate = {
        id: 'gt-1',
        name: 'Standard Midterm',
        exam_type: 'internal',
        duration_minutes: 90,
        total_marks: 100,
        sections: [{ title: 'Section A', question_count: 5 }],
      };

      const fetchQB = createQueryBuilder({
        single: jest.fn().mockResolvedValue({ data: globalTemplate, error: null }),
      });
      const insertQB = createQueryBuilder({
        single: jest.fn().mockResolvedValue({
          data: { id: 'new-tpl-1' },
          error: null,
        }),
      });
      const sectionQB = createQueryBuilder({
        insert: jest.fn().mockResolvedValue({ error: new Error('Section insert failed') }),
      });
      const rollbackQB = createQueryBuilder();

      mockSupabaseClient.from
        .mockReturnValueOnce(fetchQB)
        .mockReturnValueOnce(insertQB)
        .mockReturnValueOnce(sectionQB)
        .mockReturnValueOnce(rollbackQB);

      await expect(
        service.cloneTemplate('inst-1', 'user-1', 'gt-1'),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('should throw InternalServerErrorException when template insert fails', async () => {
      const globalTemplate = {
        id: 'gt-1',
        name: 'Standard Midterm',
        exam_type: 'internal',
        duration_minutes: 90,
        total_marks: 100,
        sections: [],
      };

      const fetchQB = createQueryBuilder({
        single: jest.fn().mockResolvedValue({ data: globalTemplate, error: null }),
      });
      const insertQB = createQueryBuilder({
        single: jest.fn().mockResolvedValue({
          data: null,
          error: new Error('Insert failed'),
        }),
      });

      mockSupabaseClient.from
        .mockReturnValueOnce(fetchQB)
        .mockReturnValueOnce(insertQB);

      await expect(
        service.cloneTemplate('inst-1', 'user-1', 'gt-1'),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('should prefix cloned template name with [Cloned]', async () => {
      const globalTemplate = {
        id: 'gt-1',
        name: 'Standard Midterm',
        exam_type: 'internal',
        duration_minutes: 90,
        total_marks: 100,
        sections: [],
      };

      const fetchQB = createQueryBuilder({
        single: jest.fn().mockResolvedValue({ data: globalTemplate, error: null }),
      });
      const insertQB = createQueryBuilder({
        single: jest.fn().mockResolvedValue({
          data: { id: 'new-tpl-1' },
          error: null,
        }),
      });

      mockSupabaseClient.from
        .mockReturnValueOnce(fetchQB)
        .mockReturnValueOnce(insertQB);

      await service.cloneTemplate('inst-1', 'user-1', 'gt-1');

      // Verify insert was called with the cloned name
      expect(insertQB.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          name: '[Cloned] Standard Midterm',
        }),
      );
    });
  });
});
