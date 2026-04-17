import { Type } from "class-transformer";
import {
  ArrayMaxSize,
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
  IsBoolean
} from "class-validator";

class ChoiceGroupDto {
  @IsString()
  label!: string;

  @IsInt()
  @Min(1)
  questionCount!: number;

  @IsInt()
  @Min(1)
  marks!: number;
}

class TemplateSectionDto {
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  title!: string;

  @IsOptional()
  @IsBoolean()
  isOrGroup?: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  questionCount?: number;

  @IsInt()
  @Min(1)
  @Max(1000)
  marks!: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allowedDifficulty?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allowedBloomLevels?: string[];

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  allowedUnitNumbers?: number[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  requiredTags?: string[];

  @IsOptional()
  @ValidateNested()
  @Type(() => ChoiceGroupDto)
  choiceA?: ChoiceGroupDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ChoiceGroupDto)
  choiceB?: ChoiceGroupDto;
}

export class CreateTemplateDto {
  @IsString()
  @MinLength(3)
  @MaxLength(120)
  name!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(80)
  examType!: string;

  @IsInt()
  @Min(15)
  @Max(600)
  durationMinutes!: number;

  @IsInt()
  @Min(1)
  @Max(1000)
  totalMarks!: number;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @ValidateNested({ each: true })
  @Type(() => TemplateSectionDto)
  sections?: TemplateSectionDto[];

  @IsOptional()
  @IsString()
  departmentId?: string;

  @IsOptional()
  @IsString()
  courseId?: string;

  @IsOptional()
  @IsString()
  subjectId?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  tags?: string[];
}
