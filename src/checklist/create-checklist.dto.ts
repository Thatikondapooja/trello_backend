import { IsNumber, IsString } from "class-validator";

export class CreateChecklistDto {
    @IsNumber()
    cardId: number;
    @IsString()
    title: string;
}
