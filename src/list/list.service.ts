import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { List } from "./list.entity";
import { Repository } from "typeorm";
import { Board } from "src/board/board.entity";
import { ActivityService } from "src/activity/activity.service";
import { CreateListDto } from "./CreateListDto";
import { User } from "src/user/user.entity";

@Injectable()
export class ListsService {
    constructor(
        @InjectRepository(List)
        private listRepo: Repository<List>,

        @InjectRepository(Board)
        private boardRepo: Repository<Board>,

        private activityService: ActivityService,
    ) { }

    async createList(dto: CreateListDto, user: User) {
        const board = await this.boardRepo.findOne({
            where: { id: dto.boardId },
        });

        if (!board) throw new NotFoundException("Board not found");

        const list = this.listRepo.create({
            title: dto.title,
            board,
        });

        const saved = await this.listRepo.save(list);

        await this.activityService.log(
            `List '${saved.title}' added`,
            board,
            user,
        );

        return saved;
    }


    async getListsByBoard(boardId: number) {
        return this.listRepo.find({
            where: { board: { id: boardId } },
            order: { createdAt: "ASC" },
        });
    }
}
