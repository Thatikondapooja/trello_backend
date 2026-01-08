import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
} from "typeorm";
import { Checklist } from "./checklist.entity";

@Entity()
export class ChecklistItem {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    text: string;

    @Column({ default: false })
    isCompleted: boolean;

    @ManyToOne(() => Checklist, checklist => checklist.items, {
        onDelete: "CASCADE",
    })
    checklist: Checklist;
}
