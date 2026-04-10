import { IsString, IsNotEmpty, IsNumber, IsOptional } from "class-validator";

export class AnalyzeSyllabusDto {
  @IsString()
  @IsNotEmpty()
  text!: string;

  @IsString()
  @IsOptional()
  subject?: string;
  
  @IsNumber()
  @IsOptional()
  count?: number;
}
