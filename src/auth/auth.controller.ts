import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './JwtAuthGuard';

@Controller('auth')
export class AuthController {
    constructor(private authService:AuthService){}

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


  
}
