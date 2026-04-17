import { Transform } from "class-transformer";
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Min,
  Max,
  MinLength,
  MaxLength,
} from "class-validator";

export class AnalyzeSyllabusDto {
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  @MinLength(100)
  @MaxLength(50000)
  text!: string;

  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @IsString()
  @IsOptional()
  @MaxLength(100)
  subject?: string;

  @Transform(({ value }) =>
    typeof value === "number" ? value : parseInt(value, 10),
  )
  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(50)
  count?: number;
}
