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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { SupabaseAuthGuard } from '../../auth/guards/supabase-auth.guard';
import { TenantContextGuard } from '../../tenant/guards/tenant-context.guard';
import { AcademicStructureService } from './academic-structure.service';
import {
  CreateDepartmentDto,
  UpdateDepartmentDto,
  CreateCourseDto,
  UpdateCourseDto,
  CreateBatchDto,
  UpdateBatchDto,
  CreateSubjectDto,
  UpdateSubjectDto,
} from './dto/academic-structure.dto';

@ApiTags('Academic Structure')
@ApiBearerAuth()
@UseGuards(SupabaseAuthGuard, TenantContextGuard)
@Controller({ path: 'academic-structure', version: '1' })
export class AcademicStructureController {
  constructor(private readonly service: AcademicStructureService) {}

  // ============================================================================
  // DEPARTMENTS
  // ============================================================================

  @Get('departments')
  @ApiOperation({ summary: 'Get all departments for an institution' })
  @ApiResponse({ status: 200, description: 'List of departments' })
  async getDepartments(@Headers('x-institution-id') institutionId: string) {
    return this.service.findAllDepartments(institutionId);
  }

  @Get('departments/:id')
  @ApiOperation({ summary: 'Get department by ID' })
  @ApiParam({ name: 'id', description: 'Department UUID' })
  @ApiResponse({ status: 200, description: 'Department details' })
  @ApiResponse({ status: 404, description: 'Department not found' })
  async getDepartmentById(
    @Param('id') id: string,
    @Headers('x-institution-id') institutionId: string
  ) {
    return this.service.findDepartmentById(id, institutionId);
  }

  @Post('departments')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new department' })
  @ApiResponse({ status: 201, description: 'Department created successfully' })
  @ApiResponse({ status: 409, description: 'Department code already exists' })
  async createDepartment(
    @Headers('x-institution-id') institutionId: string,
    @Headers('x-user-id') userId: string,
    @Body() dto: CreateDepartmentDto
  ) {
    return this.service.createDepartment(institutionId, dto, userId);
  }

  @Put('departments/:id')
  @ApiOperation({ summary: 'Update department' })
  @ApiParam({ name: 'id', description: 'Department UUID' })
  @ApiResponse({ status: 200, description: 'Department updated' })
  @ApiResponse({ status: 404, description: 'Department not found' })
  async updateDepartment(
    @Param('id') id: string,
    @Headers('x-institution-id') institutionId: string,
    @Body() dto: UpdateDepartmentDto
  ) {
    return this.service.updateDepartment(id, institutionId, dto);
  }

  @Delete('departments/:id')
  @ApiOperation({ summary: 'Delete department' })
  @ApiParam({ name: 'id', description: 'Department UUID' })
  @ApiResponse({ status: 200, description: 'Department deleted' })
  @ApiResponse({ status: 404, description: 'Department not found' })
  async deleteDepartment(
    @Param('id') id: string,
    @Headers('x-institution-id') institutionId: string
  ) {
    return this.service.deleteDepartment(id, institutionId);
  }

  // ============================================================================
  // COURSES
  // ============================================================================

  @Get('courses')
  @ApiOperation({ summary: 'Get all courses for an institution' })
  @ApiQuery({ name: 'department_id', required: false, description: 'Filter by department' })
  @ApiResponse({ status: 200, description: 'List of courses' })
  async getCourses(
    @Headers('x-institution-id') institutionId: string,
    @Query('department_id') departmentId?: string
  ) {
    return this.service.findAllCourses(institutionId, departmentId);
  }

  @Get('courses/:id')
  @ApiOperation({ summary: 'Get course by ID' })
  @ApiParam({ name: 'id', description: 'Course UUID' })
  @ApiResponse({ status: 200, description: 'Course details' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  async getCourseById(
    @Param('id') id: string,
    @Headers('x-institution-id') institutionId: string
  ) {
    return this.service.findCourseById(id, institutionId);
  }

  @Post('courses')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new course' })
  @ApiResponse({ status: 201, description: 'Course created successfully' })
  @ApiResponse({ status: 409, description: 'Course code already exists' })
  async createCourse(
    @Headers('x-institution-id') institutionId: string,
    @Headers('x-user-id') userId: string,
    @Body() dto: CreateCourseDto
  ) {
    return this.service.createCourse(institutionId, dto, userId);
  }

  @Put('courses/:id')
  @ApiOperation({ summary: 'Update course' })
  @ApiParam({ name: 'id', description: 'Course UUID' })
  @ApiResponse({ status: 200, description: 'Course updated' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  async updateCourse(
    @Param('id') id: string,
    @Headers('x-institution-id') institutionId: string,
    @Body() dto: UpdateCourseDto
  ) {
    return this.service.updateCourse(id, institutionId, dto);
  }

  @Delete('courses/:id')
  @ApiOperation({ summary: 'Delete course' })
  @ApiParam({ name: 'id', description: 'Course UUID' })
  @ApiResponse({ status: 200, description: 'Course deleted' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  async deleteCourse(
    @Param('id') id: string,
    @Headers('x-institution-id') institutionId: string
  ) {
    return this.service.deleteCourse(id, institutionId);
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
    @Headers('x-institution-id') institutionId: string,
    @Query('course_id') courseId?: string,
    @Query('academic_year') academicYear?: string
  ) {
    return this.service.findAllBatches(institutionId, courseId, academicYear);
  }

  @Get('batches/:id')
  @ApiOperation({ summary: 'Get batch by ID with enrollment count' })
  @ApiParam({ name: 'id', description: 'Batch UUID' })
  @ApiResponse({ status: 200, description: 'Batch details' })
  @ApiResponse({ status: 404, description: 'Batch not found' })
  async getBatchById(
    @Param('id') id: string,
    @Headers('x-institution-id') institutionId: string
  ) {
    return this.service.findBatchById(id, institutionId);
  }

  @Post('batches')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new batch' })
  @ApiResponse({ status: 201, description: 'Batch created successfully' })
  @ApiResponse({ status: 409, description: 'Batch code already exists' })
  async createBatch(
    @Headers('x-institution-id') institutionId: string,
    @Headers('x-user-id') userId: string,
    @Body() dto: CreateBatchDto
  ) {
    return this.service.createBatch(institutionId, dto, userId);
  }

  @Put('batches/:id')
  @ApiOperation({ summary: 'Update batch' })
  @ApiParam({ name: 'id', description: 'Batch UUID' })
  @ApiResponse({ status: 200, description: 'Batch updated' })
  @ApiResponse({ status: 404, description: 'Batch not found' })
  async updateBatch(
    @Param('id') id: string,
    @Headers('x-institution-id') institutionId: string,
    @Body() dto: UpdateBatchDto
  ) {
    return this.service.updateBatch(id, institutionId, dto);
  }

  @Delete('batches/:id')
  @ApiOperation({ summary: 'Delete batch' })
  @ApiParam({ name: 'id', description: 'Batch UUID' })
  @ApiResponse({ status: 200, description: 'Batch deleted' })
  @ApiResponse({ status: 404, description: 'Batch not found' })
  async deleteBatch(
    @Param('id') id: string,
    @Headers('x-institution-id') institutionId: string
  ) {
    return this.service.deleteBatch(id, institutionId);
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
    @Headers('x-institution-id') institutionId: string,
    @Query('department_id') departmentId?: string,
    @Query('course_id') courseId?: string
  ) {
    return this.service.findAllSubjects(institutionId, departmentId, courseId);
  }

  @Get('subjects/:id')
  @ApiOperation({ summary: 'Get subject by ID' })
  @ApiParam({ name: 'id', description: 'Subject UUID' })
  @ApiResponse({ status: 200, description: 'Subject details' })
  @ApiResponse({ status: 404, description: 'Subject not found' })
  async getSubjectById(
    @Param('id') id: string,
    @Headers('x-institution-id') institutionId: string
  ) {
    return this.service.findSubjectById(id, institutionId);
  }

  @Post('subjects')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new subject' })
  @ApiResponse({ status: 201, description: 'Subject created successfully' })
  @ApiResponse({ status: 409, description: 'Subject code already exists' })
  async createSubject(
    @Headers('x-institution-id') institutionId: string,
    @Headers('x-user-id') userId: string,
    @Body() dto: CreateSubjectDto
  ) {
    return this.service.createSubject(institutionId, dto, userId);
  }

  @Put('subjects/:id')
  @ApiOperation({ summary: 'Update subject' })
  @ApiParam({ name: 'id', description: 'Subject UUID' })
  @ApiResponse({ status: 200, description: 'Subject updated' })
  @ApiResponse({ status: 404, description: 'Subject not found' })
  async updateSubject(
    @Param('id') id: string,
    @Headers('x-institution-id') institutionId: string,
    @Body() dto: UpdateSubjectDto
  ) {
    return this.service.updateSubject(id, institutionId, dto);
  }

  @Delete('subjects/:id')
  @ApiOperation({ summary: 'Delete subject' })
  @ApiParam({ name: 'id', description: 'Subject UUID' })
  @ApiResponse({ status: 200, description: 'Subject deleted' })
  @ApiResponse({ status: 404, description: 'Subject not found' })
  async deleteSubject(
    @Param('id') id: string,
    @Headers('x-institution-id') institutionId: string
  ) {
    return this.service.deleteSubject(id, institutionId);
  }
}

