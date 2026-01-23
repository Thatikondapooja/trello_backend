import { Module } from '@nestjs/common';
import { Board } from './board.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BoardController } from './board.controller';
import { BoardService } from './board.service';
import { Activity } from "../activity/activity.entity";
import { ActivityModule } from "../activity/activity.module";
import { User } from "../user/user.entity";
import { List } from "../list/list.entity";

@Module({
    imports: [TypeOrmModule.forFeature([Board, Activity, User, List]), ActivityModule],
    controllers: [BoardController],
    providers: [BoardService],
    exports: [TypeOrmModule],
})
export class BoardModule { }
