import { Test, TestingModule } from '@nestjs/testing';
import { AcademicService } from './academic.service';
import { SUPABASE_ADMIN_CLIENT } from '../supabase/supabase.constants';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { InstitutionContext } from '../common/types/authenticated-request';

describe('AcademicService', () => {
  let service: AcademicService;
  let mockSupabaseClient: any;

  const mockInstitutionContext: InstitutionContext = {
    institutionId: 'inst-1',
    institutionUserId: 'inst-user-1',
    roleCodes: ['institution_admin'],
    permissionCodes: ['departments.read', 'departments.create'],
  };

  const facultyContext: InstitutionContext = {
    institutionId: 'inst-1',
    institutionUserId: 'inst-user-2',
    roleCodes: ['faculty'],
    permissionCodes: ['subjects.read'],
  };

  function createQueryBuilder(overrides: any = {}) {
    const qb: any = {
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      in: jest.fn().mockReturnThis(),
      single: jest.fn(),
      order: jest.fn().mockReturnThis(),
      returns: jest.fn(),
    };
    // Allow overrides
    Object.assign(qb, overrides);
    return qb;
  }

  beforeEach(async () => {
    const qb = createQueryBuilder();
    mockSupabaseClient = {
      from: jest.fn().mockReturnValue(qb),
      rpc: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AcademicService,
        { provide: SUPABASE_ADMIN_CLIENT, useValue: mockSupabaseClient },
      ],
    }).compile();

    service = module.get<AcademicService>(AcademicService);
  });

  describe('Departments', () => {
    describe('findAllDepartments', () => {
      it('should return all departments for an institution', async () => {
        const mockDepts = [
          { id: 'd1', name: 'CS', institution_id: 'inst-1' },
          { id: 'd2', name: 'EE', institution_id: 'inst-1' },
        ];
        const qb = createQueryBuilder({
          order: jest.fn().mockResolvedValue({ data: mockDepts, error: null }),
        });
        mockSupabaseClient.from.mockReturnValue(qb);

        const result = await service.findAllDepartments('inst-1');
        expect(result).toEqual(mockDepts);
      });

      it('should throw error when query fails', async () => {
        const qb = createQueryBuilder({
          order: jest.fn().mockResolvedValue({ data: null, error: new Error('DB error') }),
        });
        mockSupabaseClient.from.mockReturnValue(qb);

        await expect(service.findAllDepartments('inst-1')).rejects.toThrow('DB error');
      });
    });

    describe('findDepartmentById', () => {
      it('should return a department by ID', async () => {
        const mockDept = { id: 'd1', name: 'CS', institution_id: 'inst-1' };
        const qb = createQueryBuilder({
          single: jest.fn().mockResolvedValue({ data: mockDept, error: null }),
        });
        mockSupabaseClient.from.mockReturnValue(qb);

        const result = await service.findDepartmentById('d1', 'inst-1');
        expect(result).toEqual(mockDept);
      });

      it('should throw NotFoundException when department not found', async () => {
        const qb = createQueryBuilder({
          single: jest.fn().mockResolvedValue({ data: null, error: new Error('Not found') }),
        });
        mockSupabaseClient.from.mockReturnValue(qb);

        await expect(service.findDepartmentById('nonexistent', 'inst-1')).rejects.toThrow(
          NotFoundException,
        );
      });
    });

    describe('createDepartment', () => {
      it('should create a department and return it', async () => {
        const newDept = { name: 'Physics', code: 'PHY' };
        const createdDept = { id: 'd3', ...newDept, institution_id: 'inst-1' };

        // First call: check for duplicate (no existing)
        // Second call: insert
        const noExistingQB = createQueryBuilder({
          single: jest.fn().mockResolvedValue({ data: null, error: null }),
        });
        const insertQB = createQueryBuilder({
          single: jest.fn().mockResolvedValue({ data: createdDept, error: null }),
        });
        mockSupabaseClient.from.mockReturnValueOnce(noExistingQB).mockReturnValueOnce(insertQB);

        const result = await service.createDepartment('inst-1', newDept, 'user-1');
        expect(result).toEqual(createdDept);
      });

      it('should throw ConflictException when code already exists', async () => {
        const existingQB = createQueryBuilder({
          single: jest.fn().mockResolvedValue({ data: { id: 'existing' }, error: null }),
        });
        mockSupabaseClient.from.mockReturnValue(existingQB);

        await expect(
          service.createDepartment('inst-1', { name: 'CS', code: 'CS' }, 'user-1'),
        ).rejects.toThrow(ConflictException);
      });
    });

    describe('deleteDepartment', () => {
      it('should delete a department and return success', async () => {
        // findDepartmentById call
        const findQB = createQueryBuilder({
          single: jest.fn().mockResolvedValue({ data: { id: 'd1' }, error: null }),
        });
        // delete call
        const deleteQB = createQueryBuilder({
          eq: jest.fn().mockReturnThis(),
        });
        // Need to handle the chained .eq() calls properly
        const deleteChain = {
          eq: jest.fn().mockReturnThis(),
        };
        const deleteResult = {
          eq: jest.fn().mockResolvedValue({ error: null }),
        };
        deleteChain.eq = jest.fn().mockReturnValue(deleteResult);

        mockSupabaseClient.from
          .mockReturnValueOnce(findQB)
          .mockReturnValueOnce(deleteChain);

        const result = await service.deleteDepartment('d1', 'inst-1');
        expect(result).toEqual({ success: true });
      });
    });
  });

  describe('Courses', () => {
    describe('findAllCourses', () => {
      it('should return courses for an institution', async () => {
        const mockCourses = [
          { id: 'c1', name: 'B.Tech CS', institution_id: 'inst-1' },
        ];
        const qb = createQueryBuilder({
          eq: jest.fn().mockReturnThis(),
          order: jest.fn().mockResolvedValue({ data: mockCourses, error: null }),
        });
        mockSupabaseClient.from.mockReturnValue(qb);

        const result = await service.findAllCourses('inst-1');
        expect(result).toEqual(mockCourses);
      });

      it('should filter by departmentId when provided', async () => {
        const qb = createQueryBuilder({
          eq: jest.fn().mockReturnThis(),
          order: jest.fn().mockResolvedValue({ data: [], error: null }),
        });
        mockSupabaseClient.from.mockReturnValue(qb);

        await service.findAllCourses('inst-1', 'dept-1');
        // eq should have been called with 'department_id', 'dept-1'
        expect(qb.eq).toHaveBeenCalledWith('department_id', 'dept-1');
      });
    });

    describe('findCourseById', () => {
      it('should throw NotFoundException when course not found', async () => {
        const qb = createQueryBuilder({
          single: jest.fn().mockResolvedValue({ data: null, error: new Error('Not found') }),
        });
        mockSupabaseClient.from.mockReturnValue(qb);

        await expect(service.findCourseById('nonexistent', 'inst-1')).rejects.toThrow(
          NotFoundException,
        );
      });
    });
  });

  describe('Subjects', () => {
    describe('findAllSubjects', () => {
      it('should return subjects for privileged users without filtering', async () => {
        const mockSubjects = [
          { id: 's1', name: 'Math', institution_id: 'inst-1' },
        ];
        const qb = createQueryBuilder({
          eq: jest.fn().mockReturnThis(),
          order: jest.fn().mockResolvedValue({ data: mockSubjects, error: null }),
        });
        mockSupabaseClient.from.mockReturnValue(qb);

        const result = await service.findAllSubjects(mockInstitutionContext);
        expect(result).toEqual(mockSubjects);
      });

      it('should return only assigned subjects for faculty users', async () => {
        const assignmentQB = createQueryBuilder({
          eq: jest.fn().mockReturnThis(),
        });
        const assignmentResult = {
          eq: jest.fn().mockResolvedValue({
            data: [{ subject_id: 's1' }, { subject_id: 's2' }],
            error: null,
          }),
        };
        assignmentQB.eq = jest.fn().mockReturnValue(assignmentResult);

        const subjectQB = createQueryBuilder({
          eq: jest.fn().mockReturnThis(),
          in: jest.fn().mockReturnThis(),
          order: jest.fn().mockResolvedValue({ data: [{ id: 's1' }], error: null }),
        });

        mockSupabaseClient.from
          .mockReturnValueOnce(subjectQB) // initial from call for subjects
          .mockReturnValueOnce(assignmentQB); // faculty_subject_assignments

        const result = await service.findAllSubjects(facultyContext);
        expect(mockSupabaseClient.from).toHaveBeenCalledWith('faculty_subject_assignments');
      });

      it('should return empty array for faculty with no assignments', async () => {
        const subjectQB = createQueryBuilder({
          eq: jest.fn().mockReturnThis(),
        });

        const assignmentQB = createQueryBuilder({
          eq: jest.fn().mockReturnThis(),
        });
        const assignmentResult = {
          eq: jest.fn().mockResolvedValue({
            data: [],
            error: null,
          }),
        };
        assignmentQB.eq = jest.fn().mockReturnValue(assignmentResult);

        mockSupabaseClient.from
          .mockReturnValueOnce(subjectQB)
          .mockReturnValueOnce(assignmentQB);

        const result = await service.findAllSubjects(facultyContext);
        expect(result).toEqual([]);
      });
    });

    describe('createSubject', () => {
      it('should throw ConflictException when subject code already exists', async () => {
        const existingQB = createQueryBuilder({
          single: jest.fn().mockResolvedValue({ data: { id: 'existing' }, error: null }),
        });
        mockSupabaseClient.from.mockReturnValue(existingQB);

        await expect(
          service.createSubject('inst-1', { name: 'Math', code: 'MATH101' }, 'user-1'),
        ).rejects.toThrow(ConflictException);
      });
    });
  });

  describe('Batches', () => {
    describe('findAllBatches', () => {
      it('should return batches for an institution', async () => {
        const mockBatches = [
          { id: 'b1', name: '2025 Batch', institution_id: 'inst-1' },
        ];
        const qb = createQueryBuilder({
          eq: jest.fn().mockReturnThis(),
          order: jest.fn().mockReturnThis(),
        });
        const orderedResult = {
          order: jest.fn().mockResolvedValue({ data: mockBatches, error: null }),
        };
        qb.order = jest.fn().mockReturnValue(orderedResult);

        mockSupabaseClient.from.mockReturnValue(qb);

        const result = await service.findAllBatches('inst-1');
        expect(result).toEqual(mockBatches);
      });
    });

    describe('createBatch', () => {
      it('should throw ConflictException for duplicate batch code', async () => {
        const existingQB = createQueryBuilder({
          single: jest.fn().mockResolvedValue({ data: { id: 'existing' }, error: null }),
        });
        mockSupabaseClient.from.mockReturnValue(existingQB);

        await expect(
          service.createBatch('inst-1', { name: 'Batch A', code: 'BA', course_id: 'c1', academic_year: '2025', semester: 1 }, 'user-1'),
        ).rejects.toThrow(ConflictException);
      });
    });
  });
});
