import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Activity } from "./activity.entity";
import { Board } from "../board/board.entity";
import { User } from "../user/user.entity";

@Injectable()
export class ActivityService {
    constructor(
        @InjectRepository(Activity)
        private activityRepo: Repository<Activity>,
    ) { }

    // ✅ CENTRAL ACTIVITY LOGGER
    async log(message: string, board: Board, user:User) {
        const activity = this.activityRepo.create({
            message,
            board,
            user,
        });

        return this.activityRepo.save(activity);
    }
}
