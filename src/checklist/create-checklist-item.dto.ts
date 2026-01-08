import { IsNumber, IsString } from "class-validator";

export class CreateChecklistItemDto {
    @IsNumber()
    checklistId: number;
    @IsString()
    text: string;
}
