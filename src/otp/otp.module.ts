import { forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { OtpController } from "./otp.controller";
import { OtpService } from "./otp.service";
import { Otps } from "./otp.entity";
import { User } from "src/user/user.entity";
import { MailModule } from "src/mail/mail.module";
import { AuthModule } from "src/auth/auth.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Otps, User]),
    MailModule,
    forwardRef(() => AuthModule), ],
  controllers: [OtpController],
  providers: [OtpService],
  exports: [OtpService],
})
export class OtpModule {}
