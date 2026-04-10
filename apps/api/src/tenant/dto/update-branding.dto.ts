import { IsOptional, IsString, IsObject } from "class-validator";

export class UpdateBrandingDto {
  @IsOptional()
  @IsString()
  logoUrl?: string;

  @IsOptional()
  @IsString()
  primaryColor?: string;

  @IsOptional()
  @IsString()
  secondaryColor?: string;

  @IsOptional()
  @IsObject()
  customSettings?: Record<string, any>;
}
