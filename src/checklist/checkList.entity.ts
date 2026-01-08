import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    OneToMany,
    CreateDateColumn,
} from "typeorm";
import { Card } from "../card/card.entity";
import { ChecklistItem } from "./checklist-item.entity";

@Entity()
export class Checklist {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @ManyToOne(() => Card, card => card.checklists, { onDelete: "CASCADE" })
    card: Card;

    @OneToMany(() => ChecklistItem, item => item.checklist, { cascade: true })
    items: ChecklistItem[];

    @CreateDateColumn()
    createdAt: Date;
}
