import { Transform } from "class-transformer";
import { IsIn, IsOptional, IsString, MaxLength } from "class-validator";

const institutionStatuses = ["active", "trial", "suspended", "archived"] as const;

export class UpdateInstitutionStatusDto {
  @IsIn(institutionStatuses)
  status!: (typeof institutionStatuses)[number];

  @IsOptional()
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @IsString()
  @MaxLength(240)
  note?: string;
}
