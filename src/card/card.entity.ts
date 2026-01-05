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

    @Column({ type: "text", nullable: true })
    description: string | null;

    @Column({ type: "date", nullable: true })
    dueDate: Date | null;

    @Column({ type: "int", nullable: true })
    reminderMinutes: number|null;

    @Column({ default: false })
    reminderSent: boolean


    @Column("jsonb", { default: [] })
    labels: { name: string; color: string }[];

    @Column()
    position: number;

    @CreateDateColumn()
    createdAt: Date;

    @ManyToOne(() => List, list => list.cards, { onDelete: "CASCADE" })
    list: List;
}
