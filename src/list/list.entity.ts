import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    OneToMany,
    CreateDateColumn,
} from "typeorm";
import { Board } from "../board/board.entity";
import { Card } from "src/card/card.entity";

@Entity()
export class List {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @ManyToOne(() => Board, (board) => board.lists)
    board: Board;

    @OneToMany(() => Card, (card) => card.list)
    cards: Card[];

    @CreateDateColumn()
    createdAt: Date;
}
