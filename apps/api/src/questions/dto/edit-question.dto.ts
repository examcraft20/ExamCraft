import { PartialType } from "@nestjs/swagger";
import { CreateQuestionDto } from "./create-question.dto";

export class EditQuestionDto extends PartialType(CreateQuestionDto) {}
