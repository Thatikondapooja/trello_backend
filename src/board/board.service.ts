import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Board } from "./board.entity";
import { ActivityService } from "../activity/activity.service";
import { CreateBoardDto } from "./createBoardDto";
import { User } from "src/user/user.entity";
import { List } from "src/list/list.entity";

@Injectable()
export class BoardService {

    constructor(
        @InjectRepository(Board)
        private readonly boardRepo: Repository<Board>,
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
        @InjectRepository(List)
        private readonly listRepo: Repository<List>,
        private readonly activityService: ActivityService,
    ) { }

    /* CREATE BOARD */
    async createBoard(dto: CreateBoardDto, userId: number) {
        const user = await this.userRepo.findOne({
            where: { id: userId },
        });

        if (!user) {
            throw new Error("User not found");
        }

        const board = this.boardRepo.create({
            title: dto.title,
            description: dto.description,
            owner: user, // ✅ REAL USER ENTITY
            members: [user], // 🔥 IMPORTANT

        });
        console.log(" board owner", board.owner)
        console.log("board", board)

        const savedBoard = await this.boardRepo.save(board);
        console.log("savedBoard", savedBoard)

        // 🔥 CREATE DEFAULT LISTS
        const defaultLists = ["To Do", "Doing", "Done"];
        for (const title of defaultLists) {
            const list = this.listRepo.create({
                title,
                board: savedBoard,
            });
            await this.listRepo.save(list);
        }

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

    async getBoardMembers(boardId: number) {
        const board = await this.boardRepo.findOne({
            where: { id: boardId },
            relations: ["members"],
        });

        if (!board) {
            throw new NotFoundException("Board not found");
        }

        return board.members;
    }


}
