import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
} from "typeorm";
import { List } from "../list/list.entity";

@Entity()
export class Card {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @ManyToOne(() => List, (list) => list.cards)
    list: List;

    @CreateDateColumn()
    createdAt: Date;
    
    @Column({ type: "int" })
    position: number; // 👈 CARD ORDER
}
