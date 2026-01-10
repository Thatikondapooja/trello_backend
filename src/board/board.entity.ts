import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    OneToMany,
    CreateDateColumn,
    ManyToMany,
    JoinTable,
} from "typeorm";
import { User } from "../user/user.entity";
import { List } from "src/list/list.entity";

@Entity()
export class Board {
    @PrimaryGeneratedColumn() 
    id: number;

    @Column()
    title: string;

    @Column({ nullable: true })
    description?: string;

    @ManyToOne(() => User, (user) => user.boards)
    owner: User;

    @OneToMany(() => List, (list) => list.board)
    lists: List[];

    @ManyToMany(() => User)
    @JoinTable()
    members: User[];

    @CreateDateColumn()
    createdAt: Date;
}
