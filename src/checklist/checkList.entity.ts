import { Card } from "src/card/card.entity";
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ChecklistItem } from "./checklist-item.entity";

@Entity()
export class Checklist {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @ManyToOne(() => Card, card => card.checklists, {
        onDelete: "CASCADE",
    })
    card: Card;

    @OneToMany(() => ChecklistItem, item => item.checklist, {
        cascade: true,
    })
    items: ChecklistItem[];
}
