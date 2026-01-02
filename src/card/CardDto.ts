import { Type } from "class-transformer";
import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateCardDto {
    @IsNotEmpty()
    @IsString()
    title: string;

    @Type(() => Number)
    @IsNumber()
    listId: number;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @Type(() => Date)
    dueDate?: Date;

    @IsOptional()
    label?: string[];
}
