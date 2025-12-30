import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateListDto {
    @IsNotEmpty()
    title: string;

    @IsNumber()
    boardId: number;
}
