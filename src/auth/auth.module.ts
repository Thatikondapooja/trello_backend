import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { JwtModule } from "@nestjs/jwt";

import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { User } from "../user/user.entity";
import { JwtStrategy } from "./JwtStrategy";
import { UserService } from "../user/user.service";
import { OtpService } from "src/otp/otp.service";
import { Otps } from "src/otp/otp.entity";
import { OtpModule } from "src/otp/otp.module";
import { UserModule } from "src/user/user.module";
import { forwardRef } from "@nestjs/common";

@Module({
    imports: [
        UserModule,
        forwardRef(() => OtpModule),
    TypeOrmModule.forFeature([User]), // even if already in user module

        // ✅ jwtstrategy import
        JwtModule.register({
            secret: "JWT_SECRET_KEY", // later move to .env
            signOptions: { expiresIn: "1d" },
        }),

    ],
    controllers: [AuthController],
    providers: [AuthService, JwtStrategy],
    exports: [AuthService, JwtModule],
})
export class AuthModule { }
