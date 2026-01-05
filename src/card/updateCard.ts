import { IsOptional, IsString, IsDateString } from "class-validator";

export class UpdateCardDto {
    @IsOptional()
    @IsString()
    title?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsDateString()
    dueDate?: string;

    @IsOptional()
    labels?:{
        name:string
        color:string
    }[]
    // labels?: string[];
    @IsOptional()
    reminderMinutes?: number | null; // ✅ REQUIRED

}
