 import { Type } from "class-transformer";
import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateCardDto {
     @IsNotEmpty()
    title: string;


    @Type(() => Number)   // 🔥 REQUIRED
    @IsNumber()
    listId: number;
}
