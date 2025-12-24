import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { List } from "./list.entity";
import { Board } from "src/board/board.entity";
import { ActivityService } from "../activity/activity.service";
import { User } from "src/user/user.entity";

@Injectable()
export class ListsService {
   
    constructor(
        @InjectRepository(List)
        private listRepo: Repository<List>,

        @InjectRepository(Board)
        private boardRepo: Repository<Board>,
        private activityService: ActivityService, // ✅ inject activity service
) { }

    // Create list inside a board
    async createList(title: string, boardId: string, user: User) {
        const board = await this.boardRepo.findOne({
            where: { id: boardId },
        });

        if (!board) {
            throw new NotFoundException("Board not found");
        }

        const list = this.listRepo.create({
            title,
            board,
        });

        const listSaved = await this.listRepo.save(list);

        await this.activityService.log(
            `List '${listSaved.title}' added`,
            board,
            user,
        );

        return listSaved;
    }
    getListsByBoard(boardId: string) {
        return this.listRepo.find({
            relations: ["board"],
            order: { createdAt: "ASC" },
        });
    }
}