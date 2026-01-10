import { IsInt, IsNumber, IsString } from "class-validator";

export class CreateChecklistItemDto {
      @IsInt()
    checklistId: number;
    @IsString()
    text: string;
}
