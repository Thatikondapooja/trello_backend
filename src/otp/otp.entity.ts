import {
    Entity,
    PrimaryGeneratedColumn,
    ManyToOne,
    Column,
    CreateDateColumn,
    Index,
} from 'typeorm';
import { User } from 'src/user/user.entity';

export enum OtpPurpose {
    LOGIN = 'LOGIN',
    FORGOT_PASSWORD = 'FORGOT_PASSWORD',
    PASSWORD_RESET = 'PASSWORD_RESET',
}

@Entity('otps')
@Index(['user', 'purpose'])
export class Otps {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, user => user.otps, {
        onDelete: 'CASCADE',
    })
    user: User;

    @Column()
    otpHash: string;

    @Column({
        type: 'enum',
        enum: OtpPurpose,
    })
    purpose: OtpPurpose;

    @Column({ type: 'timestamp' })
    expiresAt: Date;

    @Column({ default: 0 })
    attempts: number;

    @CreateDateColumn()
    createdAt: Date;
    static purpose: string;
    // ✅ Add this column
    @Column({ default: false })
    isUsed: boolean;
}
