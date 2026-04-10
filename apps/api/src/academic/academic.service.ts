import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException
} from "@nestjs/common";
import { SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_ADMIN_CLIENT } from "../supabase/supabase.constants";
import { AuthenticatedUser, TenantContext } from "../common/types/authenticated-request";
import { CreateDepartmentDto, CreateCourseDto, CreateSubjectDto } from "./dto/create-academic.dto";

@Injectable()
export class AcademicService {
  constructor(
    @Inject(SUPABASE_ADMIN_CLIENT)
    private readonly supabaseAdminClient: SupabaseClient
  ) {}

  // Departments
  async listDepartments(tenantContext: TenantContext) {
    const { data, error } = await this.supabaseAdminClient
      .from("institution_departments")
      .select("*")
      .eq("institution_id", tenantContext.institutionId)
      .eq("status", "active")
      .order("name", { ascending: true });

    if (error) {
      throw new InternalServerErrorException("Failed to load departments.");
    }

    return data;
  }

  async createDepartment(tenantContext: TenantContext, dto: CreateDepartmentDto) {
    this.assertManagePermission(tenantContext);
    const { data, error } = await this.supabaseAdminClient
      .from("institution_departments")
      .insert({
        institution_id: tenantContext.institutionId,
        name: dto.name,
        code: dto.code
      })
      .select()
      .single();

    if (error) {
      throw new InternalServerErrorException("Failed to create department.");
    }
    return data;
  }

  // Courses
  async listCourses(tenantContext: TenantContext) {
    const { data, error } = await this.supabaseAdminClient
      .from("institution_courses")
      .select("*")
      .eq("institution_id", tenantContext.institutionId)
      .eq("status", "active")
      .order("name", { ascending: true });

    if (error) {
      throw new InternalServerErrorException("Failed to load courses.");
    }
    return data;
  }

  async createCourse(tenantContext: TenantContext, dto: CreateCourseDto) {
    this.assertManagePermission(tenantContext);
    const { data, error } = await this.supabaseAdminClient
      .from("institution_courses")
      .insert({
        institution_id: tenantContext.institutionId,
        department_id: dto.departmentId,
        name: dto.name,
        code: dto.code
      })
      .select()
      .single();

    if (error) {
      throw new InternalServerErrorException("Failed to create course.");
    }
    return data;
  }

  // Subjects
  async listSubjects(tenantContext: TenantContext) {
    const { data, error } = await this.supabaseAdminClient
      .from("institution_subjects")
      .select("*")
      .eq("institution_id", tenantContext.institutionId)
      .eq("status", "active")
      .order("name", { ascending: true });

    if (error) {
      throw new InternalServerErrorException("Failed to load subjects.");
    }
    return data;
  }

  async createSubject(tenantContext: TenantContext, dto: CreateSubjectDto) {
    this.assertManagePermission(tenantContext);
    const { data, error } = await this.supabaseAdminClient
      .from("institution_subjects")
      .insert({
        institution_id: tenantContext.institutionId,
        department_id: dto.departmentId,
        course_id: dto.courseId,
        name: dto.name,
        code: dto.code
      })
      .select()
      .single();

    if (error) {
      throw new InternalServerErrorException("Failed to create subject.");
    }
    return data;
  }

  private assertManagePermission(tenantContext: TenantContext) {
    if (!tenantContext.permissionCodes.includes("academic_structure.manage")) {
      throw new BadRequestException("Your current role cannot manage the academic structure.");
    }
  }
}
