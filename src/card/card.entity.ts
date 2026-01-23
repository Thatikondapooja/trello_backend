import { Checklist } from "../checklist/checklist.entity";
import { List } from "src/list/list.entity";
import { User } from "src/user/user.entity";
import { Column, CreateDateColumn, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Card {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column({ type: "text", nullable: true })
    description: string | null;

    @Column({ type: "timestamp", nullable: true })
    dueDate: Date | null;

    @Column({ default: false })
    isCompleted: boolean;

    @Column({ type: "int", nullable: true })
    reminderMinutes: number | null;

    @Column({ default: false })
    reminderSent: boolean;

    @Column("jsonb", { default: [] })
    labels: { name: string; color: string }[];

    @Column()
    position: number;

    @ManyToMany(() => User)
    @JoinTable()
    members: User[];


    @CreateDateColumn()
    createdAt: Date;

    @ManyToOne(() => List, list => list.cards)
    list: List;
    @OneToMany(() => Checklist, checklist => checklist.card)
    checklists: Checklist[];



}
