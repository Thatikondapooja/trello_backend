import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    OneToMany,
    CreateDateColumn,
} from "typeorm";
import { User } from "../user/user.entity";
import { List } from "src/list/list.entity";

@Entity()
export class Board {
    @PrimaryGeneratedColumn() 
       id: string;

    @Column()
    title: string;

    @ManyToOne(() => User, (user) => user.boards)
    user: User;

    @OneToMany(() => List, (list) => list.board)
    lists: List[];

    @CreateDateColumn()
    createdAt: Date;
}
