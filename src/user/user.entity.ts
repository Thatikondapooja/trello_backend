import { Board } from "src/board/board.entity";
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class User{
    @PrimaryGeneratedColumn()
    id:string;

    @Column({unique:true})
    email:string;

    @Column()
    password:string;

    @OneToMany(()=> Board, (board)=> board.user)
    boards:Board[];

    @CreateDateColumn()
    createdAt:Date;
}