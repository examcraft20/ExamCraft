import { IsString, IsOptional, IsUUID, IsInt, Min, Max, IsEnum, IsBoolean, IsDateString } from 'class-validator';

export enum AcademicLevel {
  UNDERGRADUATE = 'undergraduate',
  POSTGRADUATE = 'postgraduate',
  DOCTORAL = 'doctoral',
}

export enum SubjectType {
  THEORY = 'theory',
  PRACTICAL = 'practical',
  PROJECT = 'project',
  ELECTIVE = 'elective',
}

export enum BatchStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  ARCHIVED = 'archived',
}

// Department DTOs
export class CreateDepartmentDto {
  @IsString()
  name!: string;

  @IsString()
  @IsOptional()
  code?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUUID()
  @IsOptional()
  head_user_id?: string;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}

export class UpdateDepartmentDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  code?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUUID()
  @IsOptional()
  head_user_id?: string;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}

// Course DTOs
export class CreateCourseDto {
  @IsString()
  name!: string;

  @IsString()
  @IsOptional()
  code?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUUID()
  @IsOptional()
  department_id?: string;

  @IsInt()
  @IsOptional()
  credits?: number;

  @IsEnum(AcademicLevel)
  @IsOptional()
  level?: AcademicLevel;

  @IsInt()
  @IsOptional()
  duration_semesters?: number;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}

export class UpdateCourseDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  code?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUUID()
  @IsOptional()
  department_id?: string;

  @IsInt()
  @IsOptional()
  credits?: number;

  @IsEnum(AcademicLevel)
  @IsOptional()
  level?: AcademicLevel;

  @IsInt()
  @IsOptional()
  duration_semesters?: number;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}

// Batch DTOs
export class CreateBatchDto {
  @IsString()
  name!: string;

  @IsString()
  code?: string;

  @IsUUID()
  course_id!: string;

  @IsString()
  academic_year!: string;

  @IsInt()
  @Min(1)
  @Max(8)
  semester!: number;

  @IsDateString()
  @IsOptional()
  start_date?: string;

  @IsDateString()
  @IsOptional()
  end_date?: string;

  @IsInt()
  @IsOptional()
  capacity?: number;

  @IsEnum(BatchStatus)
  @IsOptional()
  status?: BatchStatus;
}

export class UpdateBatchDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  code?: string;

  @IsUUID()
  @IsOptional()
  course_id?: string;

  @IsString()
  @IsOptional()
  academic_year?: string;

  @IsInt()
  @Min(1)
  @Max(8)
  @IsOptional()
  semester?: number;

  @IsDateString()
  @IsOptional()
  start_date?: string;

  @IsDateString()
  @IsOptional()
  end_date?: string;

  @IsInt()
  @IsOptional()
  capacity?: number;

  @IsEnum(BatchStatus)
  @IsOptional()
  status?: BatchStatus;
}

// Subject DTOs
export class CreateSubjectDto {
  @IsString()
  name!: string;

  @IsString()
  @IsOptional()
  code?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUUID()
  @IsOptional()
  department_id?: string;

  @IsUUID()
  @IsOptional()
  course_id?: string;

  @IsInt()
  @IsOptional()
  credits?: number;

  @IsEnum(SubjectType)
  @IsOptional()
  subject_type?: SubjectType;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}

export class UpdateSubjectDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  code?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUUID()
  @IsOptional()
  department_id?: string;

  @IsUUID()
  @IsOptional()
  course_id?: string;

  @IsInt()
  @IsOptional()
  credits?: number;

  @IsEnum(SubjectType)
  @IsOptional()
  subject_type?: SubjectType;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}

