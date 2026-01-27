import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './JwtAuthGuard';
import { VerifyForgotOtpDto } from 'src/otp/verifyForgotPwdDto';
import { OtpPurpose } from 'src/otp/otp.entity';
import { OtpService } from 'src/otp/otp.service';

@Controller('auth')
export class AuthController {
    constructor(private authService:AuthService,
          private otpService:OtpService,
    ){}

    @Post("register")
    register(@Body() body: { FullName:string ,email:string ,password:string}){
        return this.authService.register(body.FullName,body.email,body.password)
    };

    @Post("login")
    login(@Body() body: { email: string, password: string }) {
        return this.authService.login(body.email, body.password)
    }

    @UseGuards(JwtAuthGuard)
    @Get("profile")
    getProfile(@Req() req: any) {
        return {
            message: "JWT is working",
            user: req.user,
        };    
    } 
    
    
    
    @Post("refresh")
    async refresh(@Body() body: { refreshToken: string }) {
        return this.authService.refresh(body.refreshToken);
    }


     @Post('verify-forgot-otp')
    async verifyForgotOtp(@Body() dto: VerifyForgotOtpDto) {
        // Use the purpose from DTO to verify
        const result = await this.otpService.verifyOtp(
            dto.email,
            dto.otp,
            OtpPurpose.FORGOT_PASSWORD // always use FORGOT_PASSWORD here
        );

        return { message: 'OTP verified successfully' };
    }




   @Post('reset-password')
    async resetPassword(@Body() dto: { email: string, password: string }) {
        return this.authService.resetPassword(dto);
    }

  
}
