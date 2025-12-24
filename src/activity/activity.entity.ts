import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
} from "typeorm";
import { Board } from "../board/board.entity";
import { User } from "../user/user.entity";

@Entity()
export class Activity {
    @PrimaryGeneratedColumn()
    id: string;

    @Column()
    message: string;

    @ManyToOne(() => Board)
    board: Board;

    // ✅ NEW: who performed the action
    @ManyToOne(() => User)
    user: User;

    @CreateDateColumn()
    createdAt: Date;
}
