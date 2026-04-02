import { Transform } from "class-transformer";
import { IsIn, IsOptional, IsString, MaxLength } from "class-validator";

const reviewActions = ["approve", "reject", "archive", "comment"] as const;

export class ReviewContentDto {
  @IsIn(reviewActions)
  action!: (typeof reviewActions)[number];

  @IsOptional()
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @IsString()
  @MaxLength(240)
  comment?: string;
}
