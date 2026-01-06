import { Card } from "src/card/card.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Checklist {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @ManyToOne(() => Card, card => card.checklists, { onDelete: "CASCADE" })
    card: Card;

    // @OneToMany(() => ChecklistItem, item => item.checklist)
    // items: ChecklistItem[];

    @CreateDateColumn()
    createdAt: Date;
}
