import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { randomInt } from "crypto";
import { User } from "src/user/user.entity";
import { Otps, OtpPurpose } from "./otp.entity";
import { MailService } from "src/mail/mail.service";
import { Repository } from "typeorm";
import * as bcrypt from 'bcrypt'
@Injectable()
export class OtpService {
    constructor(
        @InjectRepository(Otps) private otpRepo: Repository<Otps>,
        @InjectRepository(User) private userRepo: Repository<User>,
        private mailService: MailService,
    ) { }

    private generateOtpString(): string {
        return randomInt(0, 1_000_000).toString().padStart(6, '0');
    }

    async createAndSendOtp(email: string, purpose: OtpPurpose) {
        const user = await this.userRepo.findOne({
            where: { email },

        });

        console.log("OTP: Found user →", user);

        if (!user) throw new NotFoundException('User not found');

        const purposes = await this.otpRepo.delete({
            user: { id: user.id },
            purpose: purpose
        });

        console.log(" delete purposes", purposes)
        const otpPlain = this.generateOtpString();
        console.log("otpPlain:", otpPlain);

        const otpHash = await bcrypt.hash(otpPlain, 10);
        console.log("otpHash:", otpHash);

        const otpEntity = this.otpRepo.create({
            user: user,           // ✔ FIXED — proper relation
            otpHash,
            purpose,
            expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        });

        await this.otpRepo.save(otpEntity);

        console.log("Sending OTP to:", user.email);

        await this.mailService.sendOtpEmail(user.email, otpPlain, purpose);

        return { message: 'OTP sent successfully' };
    }

    async verifyOtp(email: string, otp: string, purpose: OtpPurpose) {
        const user = await this.userRepo.findOne({ where: { email } });
        if (!user) throw new NotFoundException('User not found');

        const otpEntity = await this.otpRepo.findOne({
            where: { user: { id: user.id }, purpose },
            relations: ['user'],
            order: { createdAt: 'DESC' },
        });

        if (!otpEntity) throw new BadRequestException('No OTP found');

        if (new Date() > otpEntity.expiresAt) {
            await this.otpRepo.delete(otpEntity.id);
            throw new BadRequestException('OTP expired');
        }

        if (otpEntity.attempts >= 3) {
            await this.otpRepo.delete(otpEntity.id);
            throw new BadRequestException('Too many attempts');
        }

        const isMatch = await bcrypt.compare(otp, otpEntity.otpHash);
        if (!isMatch) {
            otpEntity.attempts++;
            await this.otpRepo.save(otpEntity);
            throw new BadRequestException('Invalid OTP');
        }

        // Delete OTP for FORGOT_PASSWORD flow
        if (purpose === OtpPurpose.FORGOT_PASSWORD) {
            await this.otpRepo.delete(otpEntity.id); // here we can delete the forgot pwd immedietly. if you donnot want delete immediatly we can use   otpEntity.isUsed = true;
            // await this.otpRepo.save(otpEntity); if block.
        } else {
            otpEntity.isUsed = true;
            await this.otpRepo.save(otpEntity);
        }

        return { message: 'OTP verified successfully', user };
    }
}
