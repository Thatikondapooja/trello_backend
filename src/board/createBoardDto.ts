import { IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";

export class CreateBoardDto {
    @IsString()
    @IsNotEmpty({ message: "Board title is required" })
    @MaxLength(100, { message: "Title too long" })
    title: string;

    @IsString()
    @IsOptional()
    @MaxLength(255)
    description?: string;
}
