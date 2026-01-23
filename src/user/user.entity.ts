import { Board } from "../board/board.entity";
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class User {
    @PrimaryGeneratedColumn("increment")
    id: number;

    @Column()
    FullName: string;

    @Column({ unique: true })
    email: string;

    @Column()
    password: string;

    // 🔐 Refresh token (hashed)
    @Column({ type: "text", nullable: true })
    refreshToken?: string | null;

    @OneToMany(() => Board, (board) => board.owner)
    boards: Board[];

    @CreateDateColumn()
    createdAt: Date;
}