import { IsInt, IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateChecklistDto {
    @IsInt()
    cardId: number;

    @IsString()
    @IsNotEmpty()
    title: string;

}
