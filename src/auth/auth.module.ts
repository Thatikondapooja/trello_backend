import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { JwtModule } from "@nestjs/jwt";

import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { User } from "src/user/user.entity";
import { JwtStrategy } from "./JwtStrategy";

@Module({
    imports: [
        TypeOrmModule.forFeature([User]),

        // ✅ jwtstrategy import
        JwtModule.register({
            secret: "JWT_SECRET_KEY", // later move to .env
            signOptions: { expiresIn: "1d" },
        }),
    ],
    controllers: [AuthController],
    providers: [AuthService,JwtStrategy],
})
export class AuthModule { }
