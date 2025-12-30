import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Board } from "./board.entity";
import { ActivityService } from "../activity/activity.service";
import { CreateBoardDto } from "./createBoardDto";
import { User } from "src/user/user.entity";

@Injectable()
export class BoardService {
    constructor(
        @InjectRepository(Board)
        private readonly boardRepo: Repository<Board>,

        private readonly activityService: ActivityService,
    ) { }

    /* CREATE BOARD */
    async createBoard(dto: CreateBoardDto, user: User) {
        const board = this.boardRepo.create({
            title: dto.title,
            description: dto.description,
            owner:user // ✅ relation mapping
        });

        const savedBoard = await this.boardRepo.save(board);
        console.log("savedBoard", savedBoard)
        // activity log
        await this.activityService.log(
            `Board '${savedBoard.title}' created`,
            savedBoard,
            user,
        );

        return savedBoard;
    }

    /* GET USER BOARDS */
    async getBoards(userId: number) {
        return this.boardRepo.find({
            where: {
                owner: { id: userId },
            },
            order: { createdAt: "DESC" },
        });
    }
}
