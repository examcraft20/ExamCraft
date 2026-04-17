import { Transform } from "class-transformer";
import {
  ArrayMaxSize,
  IsArray,
  IsIn,
  IsOptional,
  IsString,
  IsInt,
  Min,
  Max,
  MaxLength,
  MinLength
} from "class-validator";

const difficultyLevels = ["easy", "medium", "hard"] as const;

export class CreateQuestionDto {
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @IsString()
  @MinLength(5)
  @MaxLength(180)
  title!: string;

  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  subject!: string;

  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @IsString()
  @MinLength(2)
  @MaxLength(60)
  bloomLevel!: string;

  @IsIn(difficultyLevels)
  difficulty!: (typeof difficultyLevels)[number];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(8)
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @IsString({ each: true })
  courseOutcomes?: string[];

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(20)
  unitNumber?: number;

  @IsOptional()
  @IsString()
  departmentId?: string;

  @IsOptional()
  @IsString()
  courseId?: string;
}
