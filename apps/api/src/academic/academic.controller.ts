import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { SupabaseAuthGuard } from "../auth/guards/supabase-auth.guard";
import { TenantContextGuard } from "../tenant/guards/tenant-context.guard";
import { CurrentTenant } from "../common/decorators/tenant-context.decorator";
import type {
  AuthenticatedRequest,
  TenantContext,
} from "../common/types/authenticated-request";
import { AcademicService } from "./academic.service";
import {
  CreateDepartmentDto,
  CreateCourseDto,
  CreateSubjectDto,
} from "./dto/create-academic.dto";

@Controller({ path: "academic", version: "1" })
@UseGuards(SupabaseAuthGuard, TenantContextGuard)
export class AcademicController {
  constructor(private readonly academicService: AcademicService) {}

  @Get("departments")
  async listDepartments(@CurrentTenant() tenantContext: TenantContext) {
    const departments =
      await this.academicService.listDepartments(tenantContext);
    return { departments };
  }

  @Post("departments")
  async createDepartment(
    @CurrentTenant() tenantContext: TenantContext,
    @Body() body: CreateDepartmentDto,
  ) {
    const department = await this.academicService.createDepartment(
      tenantContext,
      body,
    );
    return { department };
  }

  @Get("courses")
  async listCourses(@CurrentTenant() tenantContext: TenantContext) {
    const courses = await this.academicService.listCourses(tenantContext);
    return { courses };
  }

  @Post("courses")
  async createCourse(
    @CurrentTenant() tenantContext: TenantContext,
    @Body() body: CreateCourseDto,
  ) {
    const course = await this.academicService.createCourse(tenantContext, body);
    return { course };
  }

  @Get("subjects")
  async listSubjects(@CurrentTenant() tenantContext: TenantContext) {
    const subjects = await this.academicService.listSubjects(tenantContext);
    return { subjects };
  }

  @Post("subjects")
  async createSubject(
    @CurrentTenant() tenantContext: TenantContext,
    @Body() body: CreateSubjectDto,
  ) {
    const subject = await this.academicService.createSubject(
      tenantContext,
      body,
    );
    return { subject };
  }
}
