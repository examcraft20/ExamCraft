import { Injectable, NotFoundException, ConflictException, Inject } from '@nestjs/common';
import type { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_ADMIN_CLIENT } from '../../supabase/supabase.constants';
import { CreateDepartmentDto, UpdateDepartmentDto, CreateCourseDto, UpdateCourseDto, CreateBatchDto, UpdateBatchDto, CreateSubjectDto, UpdateSubjectDto } from './dto/academic-structure.dto';

@Injectable()
export class AcademicStructureService {
  constructor(
    @Inject(SUPABASE_ADMIN_CLIENT)
    private readonly supabase: SupabaseClient
  ) {}

  // ============================================================================
  // DEPARTMENTS
  // ============================================================================

  async findAllDepartments(institutionId: string) {
    const { data, error } = await this.supabase
      .from('institution_departments')
      .select('*')
      .eq('institution_id', institutionId)
      .order('name', { ascending: true });

    if (error) throw new Error(error.message);
    return data;
  }

  async findDepartmentById(id: string, institutionId: string) {
    const { data, error } = await this.supabase
      .from('institution_departments')
      .select('*')
      .eq('id', id)
      .eq('institution_id', institutionId)
      .single();

    if (error || !data) throw new NotFoundException('Department not found');
    return data;
  }

  async createDepartment(institutionId: string, dto: CreateDepartmentDto, userId: string) {
    // Check for duplicate code
    if (dto.code) {
      const { data: existing } = await this.supabase
        .from('institution_departments')
        .select('id')
        .eq('institution_id', institutionId)
        .eq('code', dto.code)
        .single();

      if (existing) throw new ConflictException('Department code already exists');
    }

    const { data, error } = await this.supabase
      .from('institution_departments')
      .insert([{ ...dto, institution_id: institutionId }])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async updateDepartment(id: string, institutionId: string, dto: UpdateDepartmentDto) {
    await this.findDepartmentById(id, institutionId);

    const { data, error } = await this.supabase
      .from('institution_departments')
      .update(dto)
      .eq('id', id)
      .eq('institution_id', institutionId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async deleteDepartment(id: string, institutionId: string) {
    await this.findDepartmentById(id, institutionId);

    const { error } = await this.supabase
      .from('institution_departments')
      .delete()
      .eq('id', id)
      .eq('institution_id', institutionId);

    if (error) throw new Error(error.message);
    return { success: true };
  }

  // ============================================================================
  // COURSES
  // ============================================================================

  async findAllCourses(institutionId: string, departmentId?: string) {
    let query = this.supabase
      .from('institution_courses')
      .select('*, department:institution_departments(name, code)')
      .eq('institution_id', institutionId);

    if (departmentId) {
      query = query.eq('department_id', departmentId);
    }

    const { data, error } = await query.order('name', { ascending: true });

    if (error) throw new Error(error.message);
    return data;
  }

  async findCourseById(id: string, institutionId: string) {
    const { data, error } = await this.supabase
      .from('institution_courses')
      .select('*, department:institution_departments(name, code)')
      .eq('id', id)
      .eq('institution_id', institutionId)
      .single();

    if (error || !data) throw new NotFoundException('Course not found');
    return data;
  }

  async createCourse(institutionId: string, dto: CreateCourseDto, userId: string) {
    if (dto.code) {
      const { data: existing } = await this.supabase
        .from('institution_courses')
        .select('id')
        .eq('institution_id', institutionId)
        .eq('code', dto.code)
        .single();

      if (existing) throw new ConflictException('Course code already exists');
    }

    const { data, error } = await this.supabase
      .from('institution_courses')
      .insert([{ ...dto, institution_id: institutionId }])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async updateCourse(id: string, institutionId: string, dto: UpdateCourseDto) {
    await this.findCourseById(id, institutionId);

    const { data, error } = await this.supabase
      .from('institution_courses')
      .update(dto)
      .eq('id', id)
      .eq('institution_id', institutionId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async deleteCourse(id: string, institutionId: string) {
    await this.findCourseById(id, institutionId);

    const { error } = await this.supabase
      .from('institution_courses')
      .delete()
      .eq('id', id)
      .eq('institution_id', institutionId);

    if (error) throw new Error(error.message);
    return { success: true };
  }

  // ============================================================================
  // BATCHES
  // ============================================================================

  async findAllBatches(institutionId: string, courseId?: string, academicYear?: string) {
    let query = this.supabase
      .from('institution_batches')
      .select('*, course:institution_courses(name, code)')
      .eq('institution_id', institutionId);

    if (courseId) {
      query = query.eq('course_id', courseId);
    }

    if (academicYear) {
      query = query.eq('academic_year', academicYear);
    }

    const { data, error } = await query.order('academic_year', { ascending: false }).order('semester', { ascending: true });

    if (error) throw new Error(error.message);
    return data;
  }

  async findBatchById(id: string, institutionId: string) {
    const { data, error } = await this.supabase
      .from('institution_batches')
      .select('*, course:institution_courses(name, code), enrollments:student_enrollments(count)')
      .eq('id', id)
      .eq('institution_id', institutionId)
      .single();

    if (error || !data) throw new NotFoundException('Batch not found');
    return data;
  }

  async createBatch(institutionId: string, dto: CreateBatchDto, userId: string) {
    // Check for duplicate batch code
    const { data: existing } = await this.supabase
      .from('institution_batches')
      .select('id')
      .eq('institution_id', institutionId)
      .eq('course_id', dto.course_id)
      .eq('code', dto.code)
      .single();

    if (existing) throw new ConflictException('Batch code already exists for this course');

    const { data, error } = await this.supabase
      .from('institution_batches')
      .insert([{ ...dto, institution_id: institutionId, created_by: userId }])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async updateBatch(id: string, institutionId: string, dto: UpdateBatchDto) {
    await this.findBatchById(id, institutionId);

    const { data, error } = await this.supabase
      .from('institution_batches')
      .update(dto)
      .eq('id', id)
      .eq('institution_id', institutionId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async deleteBatch(id: string, institutionId: string) {
    await this.findBatchById(id, institutionId);

    const { error } = await this.supabase
      .from('institution_batches')
      .delete()
      .eq('id', id)
      .eq('institution_id', institutionId);

    if (error) throw new Error(error.message);
    return { success: true };
  }

  // ============================================================================
  // SUBJECTS
  // ============================================================================

  async findAllSubjects(institutionId: string, departmentId?: string, courseId?: string) {
    let query = this.supabase
      .from('institution_subjects')
      .select('*, department:institution_departments(name, code), course:institution_courses(name, code)')
      .eq('institution_id', institutionId);

    if (departmentId) {
      query = query.eq('department_id', departmentId);
    }

    if (courseId) {
      query = query.eq('course_id', courseId);
    }

    const { data, error } = await query.order('name', { ascending: true });

    if (error) throw new Error(error.message);
    return data;
  }

  async findSubjectById(id: string, institutionId: string) {
    const { data, error } = await this.supabase
      .from('institution_subjects')
      .select('*, department:institution_departments(name, code), course:institution_courses(name, code)')
      .eq('id', id)
      .eq('institution_id', institutionId)
      .single();

    if (error || !data) throw new NotFoundException('Subject not found');
    return data;
  }

  async createSubject(institutionId: string, dto: CreateSubjectDto, userId: string) {
    if (dto.code) {
      const { data: existing } = await this.supabase
        .from('institution_subjects')
        .select('id')
        .eq('institution_id', institutionId)
        .eq('code', dto.code)
        .single();

      if (existing) throw new ConflictException('Subject code already exists');
    }

    const { data, error } = await this.supabase
      .from('institution_subjects')
      .insert([{ ...dto, institution_id: institutionId }])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async updateSubject(id: string, institutionId: string, dto: UpdateSubjectDto) {
    await this.findSubjectById(id, institutionId);

    const { data, error } = await this.supabase
      .from('institution_subjects')
      .update(dto)
      .eq('id', id)
      .eq('institution_id', institutionId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async deleteSubject(id: string, institutionId: string) {
    await this.findSubjectById(id, institutionId);

    const { error } = await this.supabase
      .from('institution_subjects')
      .delete()
      .eq('id', id)
      .eq('institution_id', institutionId);

    if (error) throw new Error(error.message);
    return { success: true };
  }
}


