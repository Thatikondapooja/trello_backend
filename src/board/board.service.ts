import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Board } from "./board.entity";
import { ActivityService } from "../activity/activity.service";
import { User } from "../user/user.entity";

@Injectable()
export class BoardService {
    constructor(
        @InjectRepository(Board)
        private boardRepo: Repository<Board>,

        private activityService: ActivityService, // ✅ inject activity service
    ) { }

    // CREATE BOARD
    async createBoard(title: string, user: User) {
        const board = this.boardRepo.create({
            title,
            user,
        });

        const savedBoard = await this.boardRepo.save(board);

        // ✅ LOG ACTIVITY AFTER SAVE
        await this.activityService.log(
            `Board '${savedBoard.title}' created`,
            savedBoard,
            user,
        );

        return savedBoard;
    }

    // GET BOARDS OF USER
    async getBoards(userId: string) {
        return this.boardRepo.find({
            where: {
                user: { id: userId }, // ✅ correct ownership check
            },
            order: { createdAt: "DESC" },
        });
    }
}
