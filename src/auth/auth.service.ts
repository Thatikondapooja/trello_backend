import {
    Injectable,
    BadRequestException,
    UnauthorizedException,
    NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import * as bcrypt from "bcrypt";
import { JwtService } from "@nestjs/jwt";
import { User } from "../user/user.entity";
import { UserService } from "../user/user.service";

@Injectable()
export class AuthService {
   


    constructor(
        @InjectRepository(User)
        private userRepo: Repository<User>,
        private jwtService: JwtService,
        private userService: UserService,
    ) { }

    // ---------------- REGISTER ----------------
    async register(FullName: string, email: string, password: string) {
        const existingUser = await this.userRepo.findOne({
            where: { email },
        });

        if (existingUser) {
            throw new BadRequestException("User with this email already exists");
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = this.userRepo.create({
            FullName,
            email,
            password: hashedPassword,
        });

        await this.userRepo.save(user);

        return {
            message: "User registered successfully",
            userId: user.id,
            username: user.FullName,
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
        console.log("user.id", user.id);

        console.log("Generated JWT payload:", payload);

        const accessToken = this.jwtService.sign(payload, { expiresIn: "2m" });
        console.log("Generated JWT token", accessToken);
        const refreshToken = this.jwtService.sign({ sub: user.id }, { expiresIn: "7d" });
        console.log("Generated JWT token", accessToken);


        const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
        await this.userService.setRefreshToken(Number(user.id), hashedRefreshToken);
        console.log("hashedRefreshToken", hashedRefreshToken)

        return {
            message: "Login successful",
            userId: user.id,
            FullName: user.FullName, // Include FullName for frontend header
            email: user.email,
            accessToken: accessToken,
            refreshToken: refreshToken,
        };
    }


    async refresh(refreshToken: string) {
        const payload = this.jwtService.verify(refreshToken);

        const user = await this.userService.findById(payload.sub);

        if (!user) {
            throw new UnauthorizedException();
        }

        const isValid = await this.matchRefreshToken(refreshToken, user);

        if (!isValid) {
            throw new UnauthorizedException();
        }

        const newAccessToken = this.jwtService.sign(
            { sub: user.id, email: user.email },
            { expiresIn: "15m" }
        );

        return { accessToken: newAccessToken };
    }
    async matchRefreshToken(
        refreshToken: string,
        user: any
    ): Promise<boolean> {
        if (!user.refreshToken) return false;
        return bcrypt.compare(refreshToken, user.refreshToken);
    }



    async issueTokensForUser(user: User) {
        const payload = {
            sub: user.id, email: user.email
        };
        const access = this.jwtService.sign(payload, { expiresIn: '15m' });
        console.log(" access from issueTokensForUser", access)
        const refresh = this.jwtService.sign({ sub: user.id }, { expiresIn: '7d' });
        console.log(" refresh from issueTokensForUser", refresh)
        return {
            access_token: access, refresh_token: refresh, user: {
                userId: user.id, email: user.email, FullName: user.FullName
            }
        };
    }

    async resetPassword(dto: { email: string, password: string }) {
        const user = await this.userRepo.findOne({ where: { email: dto.email } });

        if (!user) throw new NotFoundException("User not found");

        user.password = await bcrypt.hash(dto.password, 10);

        await this.userRepo.save(user);

        return { message: "Password updated successfully" };
    }

    
}


