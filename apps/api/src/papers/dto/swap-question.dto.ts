import { IsString, IsNotEmpty, IsUUID } from "class-validator";

export class SwapQuestionDto {
  @IsString()
  @IsNotEmpty()
  sectionTitle!: string;

  @IsUUID()
  @IsNotEmpty()
  oldQuestionId!: string;

  @IsUUID()
  @IsNotEmpty()
  newQuestionId!: string;
}
