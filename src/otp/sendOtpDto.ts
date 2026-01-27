import { IsEmail, IsEnum } from 'class-validator';
import { OtpPurpose } from './otp.entity';

export class SendOtpDto {
    @IsEmail()
    email: string;

    @IsEnum(OtpPurpose)
    purpose: OtpPurpose;
}
