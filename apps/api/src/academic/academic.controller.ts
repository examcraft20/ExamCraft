import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Headers,
  UseGuards,
  HttpStatus,
  HttpCode,
  InternalServerErrorException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CurrentInstitution } from '../common/decorators/institution-context.decorator';
import type { AuthenticatedUser, InstitutionContext } from '../common/types/authenticated-request';
import { SupabaseAuthGuard } from '../auth/guards/supabase-auth.guard';
import { InstitutionContextGuard } from '../institution/guards/institution-context.guard';
import { AcademicService } from './academic.service';
import {
  CreateDepartmentDto,
  UpdateDepartmentDto,
  CreateCourseDto,
  UpdateCourseDto,
  CreateBatchDto,
  UpdateBatchDto,
  CreateSubjectDto,
  UpdateSubjectDto,
} from './dto/academic.dto';

@ApiTags('Academic Structure')
@ApiBearerAuth()
@UseGuards(SupabaseAuthGuard, InstitutionContextGuard)
@Controller({ path: 'academic', version: '1' })
export class AcademicController {
  constructor(private readonly service: AcademicService) {}

  // ============================================================================
  // DEPARTMENTS
  // ============================================================================

  @Get('departments')
  @ApiOperation({ summary: 'Get all departments for an institution' })
  @ApiResponse({ status: 200, description: 'List of departments' })
  async getDepartments(@CurrentInstitution() institutionContext: InstitutionContext | undefined) {
    if (!institutionContext) throw new InternalServerErrorException('Missing institution context');
    return this.service.findAllDepartments(institutionContext.institutionId);
  }

  @Get('departments/:id')
  @ApiOperation({ summary: 'Get department by ID' })
  @ApiParam({ name: 'id', description: 'Department UUID' })
  @ApiResponse({ status: 200, description: 'Department details' })
  @ApiResponse({ status: 404, description: 'Department not found' })
  async getDepartmentById(
    @Param('id') id: string,
    @CurrentInstitution() institutionContext: InstitutionContext | undefined
  ) {
    if (!institutionContext) throw new InternalServerErrorException('Missing institution context');
    return this.service.findDepartmentById(id, institutionContext.institutionId);
  }

  @Post('departments')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new department' })
  @ApiResponse({ status: 201, description: 'Department created successfully' })
  @ApiResponse({ status: 409, description: 'Department code already exists' })
  async createDepartment(
    @CurrentInstitution() institutionContext: InstitutionContext | undefined,
    @CurrentUser() currentUser: AuthenticatedUser | undefined,
    @Body() dto: CreateDepartmentDto
  ) {
    if (!institutionContext || !currentUser) throw new InternalServerErrorException('Missing context');
    return this.service.createDepartment(institutionContext.institutionId, dto, currentUser.id);
  }

  @Put('departments/:id')
  @ApiOperation({ summary: 'Update department' })
  @ApiParam({ name: 'id', description: 'Department UUID' })
  @ApiResponse({ status: 200, description: 'Department updated' })
  @ApiResponse({ status: 404, description: 'Department not found' })
  async updateDepartment(
    @Param('id') id: string,
    @CurrentInstitution() institutionContext: InstitutionContext | undefined,
    @Body() dto: UpdateDepartmentDto
  ) {
    if (!institutionContext) throw new InternalServerErrorException('Missing institution context');
    return this.service.updateDepartment(id, institutionContext.institutionId, dto);
  }

  @Delete('departments/:id')
  @ApiOperation({ summary: 'Delete department' })
  @ApiParam({ name: 'id', description: 'Department UUID' })
  @ApiResponse({ status: 200, description: 'Department deleted' })
  @ApiResponse({ status: 404, description: 'Department not found' })
  async deleteDepartment(
    @Param('id') id: string,
    @CurrentInstitution() institutionContext: InstitutionContext | undefined
  ) {
    if (!institutionContext) throw new InternalServerErrorException('Missing institution context');
    return this.service.deleteDepartment(id, institutionContext.institutionId);
  }

  // ============================================================================
  // COURSES
  // ============================================================================

  @Get('courses')
  @ApiOperation({ summary: 'Get all courses for an institution' })
  @ApiQuery({ name: 'department_id', required: false, description: 'Filter by department' })
  @ApiResponse({ status: 200, description: 'List of courses' })
  async getCourses(
    @CurrentInstitution() institutionContext: InstitutionContext | undefined,
    @Query('department_id') departmentId?: string
  ) {
    if (!institutionContext) throw new InternalServerErrorException('Missing institution context');
    return this.service.findAllCourses(institutionContext.institutionId, departmentId);
  }

  @Get('courses/:id')
  @ApiOperation({ summary: 'Get course by ID' })
  @ApiParam({ name: 'id', description: 'Course UUID' })
  @ApiResponse({ status: 200, description: 'Course details' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  async getCourseById(
    @Param('id') id: string,
    @CurrentInstitution() institutionContext: InstitutionContext | undefined
  ) {
    if (!institutionContext) throw new InternalServerErrorException('Missing institution context');
    return this.service.findCourseById(id, institutionContext.institutionId);
  }

  @Post('courses')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new course' })
  @ApiResponse({ status: 201, description: 'Course created successfully' })
  @ApiResponse({ status: 409, description: 'Course code already exists' })
  async createCourse(
    @CurrentInstitution() institutionContext: InstitutionContext | undefined,
    @CurrentUser() currentUser: AuthenticatedUser | undefined,
    @Body() dto: CreateCourseDto
  ) {
    if (!institutionContext || !currentUser) throw new InternalServerErrorException('Missing context');
    return this.service.createCourse(institutionContext.institutionId, dto, currentUser.id);
  }

  @Put('courses/:id')
  @ApiOperation({ summary: 'Update course' })
  @ApiParam({ name: 'id', description: 'Course UUID' })
  @ApiResponse({ status: 200, description: 'Course updated' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  async updateCourse(
    @Param('id') id: string,
    @CurrentInstitution() institutionContext: InstitutionContext | undefined,
    @Body() dto: UpdateCourseDto
  ) {
    if (!institutionContext) throw new InternalServerErrorException('Missing institution context');
    return this.service.updateCourse(id, institutionContext.institutionId, dto);
  }

  @Delete('courses/:id')
  @ApiOperation({ summary: 'Delete course' })
  @ApiParam({ name: 'id', description: 'Course UUID' })
  @ApiResponse({ status: 200, description: 'Course deleted' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  async deleteCourse(
    @Param('id') id: string,
    @CurrentInstitution() institutionContext: InstitutionContext | undefined
  ) {
    if (!institutionContext) throw new InternalServerErrorException('Missing institution context');
    return this.service.deleteCourse(id, institutionContext.institutionId);
  }

  // ============================================================================
  // BATCHES
  // ============================================================================

  @Get('batches')
  @ApiOperation({ summary: 'Get all batches for an institution' })
  @ApiQuery({ name: 'course_id', required: false, description: 'Filter by course' })
  @ApiQuery({ name: 'academic_year', required: false, description: 'Filter by academic year' })
  @ApiResponse({ status: 200, description: 'List of batches' })
  async getBatches(
    @CurrentInstitution() institutionContext: InstitutionContext | undefined,
    @Query('course_id') courseId?: string,
    @Query('academic_year') academicYear?: string
  ) {
    if (!institutionContext) throw new InternalServerErrorException('Missing institution context');
    return this.service.findAllBatches(institutionContext.institutionId, courseId, academicYear);
  }

  @Get('batches/:id')
  @ApiOperation({ summary: 'Get batch by ID with enrollment count' })
  @ApiParam({ name: 'id', description: 'Batch UUID' })
  @ApiResponse({ status: 200, description: 'Batch details' })
  @ApiResponse({ status: 404, description: 'Batch not found' })
  async getBatchById(
    @Param('id') id: string,
    @CurrentInstitution() institutionContext: InstitutionContext | undefined
  ) {
    if (!institutionContext) throw new InternalServerErrorException('Missing institution context');
    return this.service.findBatchById(id, institutionContext.institutionId);
  }

  @Post('batches')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new batch' })
  @ApiResponse({ status: 201, description: 'Batch created successfully' })
  @ApiResponse({ status: 409, description: 'Batch code already exists' })
  async createBatch(
    @CurrentInstitution() institutionContext: InstitutionContext | undefined,
    @CurrentUser() currentUser: AuthenticatedUser | undefined,
    @Body() dto: CreateBatchDto
  ) {
    if (!institutionContext || !currentUser) throw new InternalServerErrorException('Missing context');
    return this.service.createBatch(institutionContext.institutionId, dto, currentUser.id);
  }

  @Put('batches/:id')
  @ApiOperation({ summary: 'Update batch' })
  @ApiParam({ name: 'id', description: 'Batch UUID' })
  @ApiResponse({ status: 200, description: 'Batch updated' })
  @ApiResponse({ status: 404, description: 'Batch not found' })
  async updateBatch(
    @Param('id') id: string,
    @CurrentInstitution() institutionContext: InstitutionContext | undefined,
    @Body() dto: UpdateBatchDto
  ) {
    if (!institutionContext) throw new InternalServerErrorException('Missing institution context');
    return this.service.updateBatch(id, institutionContext.institutionId, dto);
  }

  @Delete('batches/:id')
  @ApiOperation({ summary: 'Delete batch' })
  @ApiParam({ name: 'id', description: 'Batch UUID' })
  @ApiResponse({ status: 200, description: 'Batch deleted' })
  @ApiResponse({ status: 404, description: 'Batch not found' })
  async deleteBatch(
    @Param('id') id: string,
    @CurrentInstitution() institutionContext: InstitutionContext | undefined
  ) {
    if (!institutionContext) throw new InternalServerErrorException('Missing institution context');
    return this.service.deleteBatch(id, institutionContext.institutionId);
  }

  // ============================================================================
  // SUBJECTS
  // ============================================================================

  @Get('subjects')
  @ApiOperation({ summary: 'Get all subjects for an institution' })
  @ApiQuery({ name: 'department_id', required: false, description: 'Filter by department' })
  @ApiQuery({ name: 'course_id', required: false, description: 'Filter by course' })
  @ApiResponse({ status: 200, description: 'List of subjects' })
  async getSubjects(
    @CurrentInstitution() institutionContext: InstitutionContext | undefined,
    @Query('department_id') departmentId?: string,
    @Query('course_id') courseId?: string
  ) {
    if (!institutionContext) throw new InternalServerErrorException('Missing institution context');
    return this.service.findAllSubjects(institutionContext.institutionId, departmentId, courseId);
  }

  @Get('subjects/:id')
  @ApiOperation({ summary: 'Get subject by ID' })
  @ApiParam({ name: 'id', description: 'Subject UUID' })
  @ApiResponse({ status: 200, description: 'Subject details' })
  @ApiResponse({ status: 404, description: 'Subject not found' })
  async getSubjectById(
    @Param('id') id: string,
    @CurrentInstitution() institutionContext: InstitutionContext | undefined
  ) {
    if (!institutionContext) throw new InternalServerErrorException('Missing institution context');
    return this.service.findSubjectById(id, institutionContext.institutionId);
  }

  @Post('subjects')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new subject' })
  @ApiResponse({ status: 201, description: 'Subject created successfully' })
  @ApiResponse({ status: 409, description: 'Subject code already exists' })
  async createSubject(
    @CurrentInstitution() institutionContext: InstitutionContext | undefined,
    @CurrentUser() currentUser: AuthenticatedUser | undefined,
    @Body() dto: CreateSubjectDto
  ) {
    if (!institutionContext || !currentUser) throw new InternalServerErrorException('Missing context');
    return this.service.createSubject(institutionContext.institutionId, dto, currentUser.id);
  }

  @Put('subjects/:id')
  @ApiOperation({ summary: 'Update subject' })
  @ApiParam({ name: 'id', description: 'Subject UUID' })
  @ApiResponse({ status: 200, description: 'Subject updated' })
  @ApiResponse({ status: 404, description: 'Subject not found' })
  async updateSubject(
    @Param('id') id: string,
    @CurrentInstitution() institutionContext: InstitutionContext | undefined,
    @Body() dto: UpdateSubjectDto
  ) {
    if (!institutionContext) throw new InternalServerErrorException('Missing institution context');
    return this.service.updateSubject(id, institutionContext.institutionId, dto);
  }

  @Delete('subjects/:id')
  @ApiOperation({ summary: 'Delete subject' })
  @ApiParam({ name: 'id', description: 'Subject UUID' })
  @ApiResponse({ status: 200, description: 'Subject deleted' })
  @ApiResponse({ status: 404, description: 'Subject not found' })
  async deleteSubject(
    @Param('id') id: string,
    @CurrentInstitution() institutionContext: InstitutionContext | undefined
  ) {
    if (!institutionContext) throw new InternalServerErrorException('Missing institution context');
    return this.service.deleteSubject(id, institutionContext.institutionId);
  }
}
