import { IsString, IsNotEmpty } from "class-validator";

export class GeneratePaperDto {
  @IsString()
  @IsNotEmpty()
  templateId!: string;

  @IsString()
  @IsNotEmpty()
  title!: string;
}
