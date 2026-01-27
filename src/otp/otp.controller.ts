import { Body, Controller, forwardRef, Inject, Post } from "@nestjs/common";
import { AuthService } from "src/auth/auth.service";
import { OtpService } from "./otp.service";
import { SendOtpDto } from "./sendOtpDto";
import { VerifyOtpDto } from "./verifyOtpDto";
import { OtpPurpose } from "./otp.entity";

@Controller('auth')
export class OtpController {
    constructor(private otpService: OtpService,   @Inject(forwardRef(() => AuthService)) private authService: AuthService) { }

    // POST /auth/send-otp  { email }
    @Post('send-otp')
    async sendOtp(@Body() dto: SendOtpDto) {
        return this.otpService.createAndSendOtp(dto.email,dto.purpose);
    }
    

    // POST /auth/verify-otp  { email, otp }
    // On success, return JWT from authService (issueTokenForUser)
    @Post('verify-otp')
    async verifyOtp(@Body() dto: VerifyOtpDto) {
        const user = await this.otpService.verifyOtp(dto.email, dto.otp, dto.purpose);
        // issue JWT (authService should have method to create tokens)
        const tokens = await this.authService.issueTokensForUser(user.user);
        return tokens;
    }
}
