import { Test, TestingModule } from '@nestjs/testing';
import { TemplatesService } from './templates.service';
import { SUPABASE_ADMIN_CLIENT } from '../supabase/supabase.constants';
import {
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InstitutionContext, AuthenticatedUser } from '../common/types/authenticated-request';

describe('TemplatesService', () => {
  let service: TemplatesService;
  let mockSupabaseClient: any;

  const mockInstitutionContext: InstitutionContext = {
    institutionId: 'inst-1',
    institutionUserId: 'inst-user-1',
    roleCodes: ['faculty'],
    permissionCodes: ['templates.create', 'templates.read'],
  };

  const mockUser: AuthenticatedUser = {
    id: 'user-1',
    email: 'faculty@inst1.com',
    roleCodes: ['faculty'],
    isSuperAdmin: false,
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
      returns: jest.fn(),
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
        TemplatesService,
        { provide: SUPABASE_ADMIN_CLIENT, useValue: mockSupabaseClient },
      ],
    }).compile();

    service = module.get<TemplatesService>(TemplatesService);
  });

  describe('listTemplates', () => {
    it('should return mapped templates for an institution', async () => {
      const mockTemplates = [
        {
          id: 'tpl-1',
          name: 'Midterm',
          exam_type: 'internal',
          duration_minutes: 90,
          total_marks: 100,
          sections: [{ title: 'A', questionCount: 5, marks: 50 }],
          department_id: null,
          course_id: null,
          subject_id: null,
          status: 'draft',
          metadata: null,
          created_at: '2025-01-01T00:00:00Z',
        },
      ];
      const qb = createQueryBuilder({
        order: jest.fn().mockResolvedValue({ data: mockTemplates, error: null }),
      });
      mockSupabaseClient.from.mockReturnValue(qb);

      const result = await service.listTemplates(mockInstitutionContext);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('tpl-1');
      expect(result[0].name).toBe('Midterm');
      expect(result[0].examType).toBe('internal');
      expect(result[0].durationMinutes).toBe(90);
      expect(result[0].status).toBe('draft');
      expect(result[0].sections).toEqual([{ title: 'A', questionCount: 5, marks: 50 }]);
    });

    it('should throw InternalServerErrorException when query fails', async () => {
      const qb = createQueryBuilder({
        order: jest.fn().mockResolvedValue({ data: null, error: new Error('DB fail') }),
      });
      mockSupabaseClient.from.mockReturnValue(qb);

      await expect(service.listTemplates(mockInstitutionContext)).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('should default sections to empty array when not an array', async () => {
      const mockTemplate = {
        id: 'tpl-2',
        name: 'Final',
        exam_type: 'external',
        duration_minutes: 180,
        total_marks: 200,
        sections: 'not-an-array',
        department_id: null,
        course_id: null,
        subject_id: null,
        status: 'draft',
        metadata: null,
        created_at: '2025-01-01',
      };
      const qb = createQueryBuilder({
        order: jest.fn().mockResolvedValue({ data: [mockTemplate], error: null }),
      });
      mockSupabaseClient.from.mockReturnValue(qb);

      const result = await service.listTemplates(mockInstitutionContext);
      expect(result[0].sections).toEqual([]);
    });
  });

  describe('createTemplate', () => {
    it('should create a template and return mapped DTO', async () => {
      const createdRow = {
        id: 'tpl-new',
        name: 'Quiz',
        exam_type: 'internal',
        duration_minutes: 30,
        total_marks: 50,
        sections: [],
        department_id: null,
        course_id: null,
        subject_id: null,
        status: 'draft',
        metadata: null,
        created_at: '2025-01-01',
      };
      const qb = createQueryBuilder({
        single: jest.fn().mockResolvedValue({ data: createdRow, error: null }),
      });
      mockSupabaseClient.from.mockReturnValue(qb);

      const result = await service.createTemplate(mockInstitutionContext, mockUser, {
        name: 'Quiz',
        examType: 'internal',
        durationMinutes: 30,
        totalMarks: 50,
        sections: [],
      });
      expect(result.id).toBe('tpl-new');
      expect(result.status).toBe('draft');
    });

    it('should throw InternalServerErrorException on insert error', async () => {
      const qb = createQueryBuilder({
        single: jest.fn().mockResolvedValue({ data: null, error: new Error('Insert failed') }),
      });
      mockSupabaseClient.from.mockReturnValue(qb);

      await expect(
        service.createTemplate(mockInstitutionContext, mockUser, {
          name: 'Quiz',
          examType: 'internal',
          durationMinutes: 30,
          totalMarks: 50,
        }),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('loadTemplateForInstitution', () => {
    it('should return the template row when found', async () => {
      const mockTpl = {
        id: 'tpl-1',
        name: 'Midterm',
        exam_type: 'internal',
        status: 'draft',
      };
      const qb = createQueryBuilder({
        single: jest.fn().mockResolvedValue({ data: mockTpl, error: null }),
      });
      mockSupabaseClient.from.mockReturnValue(qb);

      const result = await service.loadTemplateForInstitution('tpl-1', 'inst-1');
      expect(result).toEqual(mockTpl);
    });

    it('should throw NotFoundException when not found', async () => {
      const qb = createQueryBuilder({
        single: jest.fn().mockResolvedValue({ data: null, error: new Error('Not found') }),
      });
      mockSupabaseClient.from.mockReturnValue(qb);

      await expect(
        service.loadTemplateForInstitution('nonexistent', 'inst-1'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateTemplate', () => {
    it('should throw BadRequestException when template status is submitted', async () => {
      // loadTemplateForInstitution returns a submitted template
      const findQB = createQueryBuilder({
        single: jest.fn().mockResolvedValue({
          data: { id: 'tpl-1', name: 'Midterm', exam_type: 'internal', duration_minutes: 90, total_marks: 100, sections: [], department_id: null, course_id: null, subject_id: null, status: 'submitted', metadata: null, created_at: '2025-01-01' },
          error: null,
        }),
      });
      mockSupabaseClient.from.mockReturnValue(findQB);

      await expect(
        service.updateTemplate(mockInstitutionContext, 'tpl-1', {
          name: 'Updated',
          examType: 'internal',
          durationMinutes: 90,
          totalMarks: 100,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should update a draft template successfully', async () => {
      const findQB = createQueryBuilder({
        single: jest.fn().mockResolvedValue({
          data: { id: 'tpl-1', name: 'Midterm', exam_type: 'internal', duration_minutes: 90, total_marks: 100, sections: [], department_id: null, course_id: null, subject_id: null, status: 'draft', metadata: null, created_at: '2025-01-01' },
          error: null,
        }),
      });
      const updateQB = createQueryBuilder({
        single: jest.fn().mockResolvedValue({
          data: { id: 'tpl-1', name: 'Updated', exam_type: 'internal', duration_minutes: 90, total_marks: 100, sections: [], department_id: null, course_id: null, subject_id: null, status: 'draft', metadata: null, created_at: '2025-01-01' },
          error: null,
        }),
      });
      mockSupabaseClient.from.mockReturnValueOnce(findQB).mockReturnValueOnce(updateQB);

      const result = await service.updateTemplate(mockInstitutionContext, 'tpl-1', {
        name: 'Updated',
        examType: 'internal',
        durationMinutes: 90,
        totalMarks: 100,
      });
      expect(result.name).toBe('Updated');
    });
  });

  describe('deleteTemplate', () => {
    it('should throw BadRequestException when deleting a submitted template', async () => {
      const findQB = createQueryBuilder({
        single: jest.fn().mockResolvedValue({
          data: { id: 'tpl-1', name: 'Midterm', exam_type: 'internal', duration_minutes: 90, total_marks: 100, sections: [], department_id: null, course_id: null, subject_id: null, status: 'submitted', metadata: null, created_at: '2025-01-01' },
          error: null,
        }),
      });
      mockSupabaseClient.from.mockReturnValue(findQB);

      await expect(
        service.deleteTemplate(mockInstitutionContext, 'tpl-1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should delete a draft template successfully', async () => {
      const findQB = createQueryBuilder({
        single: jest.fn().mockResolvedValue({
          data: { id: 'tpl-1', name: 'Midterm', exam_type: 'internal', duration_minutes: 90, total_marks: 100, sections: [], department_id: null, course_id: null, subject_id: null, status: 'draft', metadata: null, created_at: '2025-01-01' },
          error: null,
        }),
      });
      const deleteQB = createQueryBuilder({
        eq: jest.fn().mockReturnThis(),
      });
      const deleteResult = {
        eq: jest.fn().mockResolvedValue({ error: null }),
      };
      deleteQB.eq = jest.fn().mockReturnValue(deleteResult);

      mockSupabaseClient.from.mockReturnValueOnce(findQB).mockReturnValueOnce(deleteQB);

      await service.deleteTemplate(mockInstitutionContext, 'tpl-1');
    });
  });
});
