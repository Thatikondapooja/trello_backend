import { Type } from "class-transformer";
import { IsNumber, IsString } from "class-validator";

export class MoveCardDto {
        @Type(() => Number)   // 🔥 REQUIRED
    
    @IsNumber()
    toListId: number;
}
