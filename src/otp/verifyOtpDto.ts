import { IsEmail, IsEnum, IsNotEmpty, Length } from "class-validator";
import { OtpPurpose } from "./otp.entity";

export class VerifyOtpDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @Length(6, 6)
  otp: string;

  @IsEnum(OtpPurpose)
  purpose: OtpPurpose;
}
