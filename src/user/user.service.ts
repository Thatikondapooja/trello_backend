import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from "bcrypt";
import { User } from './user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private readonly userRepo: Repository<User>
    ) { }

    // ✅ FIND USER BY ID
    async findById(id: number): Promise<User | null> {
        return this.userRepo.findOneBy({id } );
    }

    // ✅ SAVE HASHED REFRESH TOKEN
    async setRefreshToken(userId: number, refreshToken: string) {
        await this.userRepo.update(userId, {
            refreshToken,
        });
    }

    // ✅ REMOVE REFRESH TOKEN (LOGOUT)
    async clearRefreshToken(userId: number) {
        await this.userRepo.update(userId, {
            refreshToken: null,
        });
    }

    // ✅ VERIFY REFRESH TOKEN
    async validateRefreshToken(
        refreshToken: string,
        user: User
    ): Promise<boolean> {
        if (!user.refreshToken) return false;
        return bcrypt.compare(refreshToken, user.refreshToken);
    }
   

}