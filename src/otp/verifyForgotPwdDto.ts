import { IsEmail, IsString, Length } from 'class-validator';

export class VerifyForgotOtpDto {
    @IsEmail()
    email: string;

    @IsString()
    @Length(6, 6)
    otp: string;

    purpose: string; // optional, we can ignore since backend uses FORGOT_PASSWORD
}
