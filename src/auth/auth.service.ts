import {
    Injectable,
    BadRequestException,
    UnauthorizedException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import * as bcrypt from "bcrypt";
import { JwtService } from "@nestjs/jwt";
import { User } from "src/user/user.entity";

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private userRepo: Repository<User>,
        private jwtService: JwtService,
    ) { }

    // ---------------- REGISTER ----------------
    async register(email: string, password: string) {
        const existingUser = await this.userRepo.findOne({
            where: { email },
        });

        if (existingUser) {
            throw new BadRequestException("User with this email already exists");
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = this.userRepo.create({
            email,
            password: hashedPassword,
        });

        await this.userRepo.save(user);

        return {
            message: "User registered successfully",
            userId: user.id,
            email: user.email,
        };
    }

    // ---------------- LOGIN ----------------
    async login(email: string, password: string) {
        const user = await this.userRepo.findOne({
            where: { email },
        });

        if (!user) {
            throw new UnauthorizedException("Invalid email or password");
        }

        const isPasswordValid = await bcrypt.compare(
            password,
            user.password,
        );

        if (!isPasswordValid) {
            throw new UnauthorizedException("Invalid email or password");
        }

        const payload = {
            sub: user.id,
            email: user.email,
        };

        console.log("Generated JWT payload:", payload);

        const token = this.jwtService.sign(payload);

        console.log("Generated JWT token", token);

        return {
            message: "Login successful",
            userId: user.id,
            email: user.email,
            accessToken: token,
        };
    }
}
