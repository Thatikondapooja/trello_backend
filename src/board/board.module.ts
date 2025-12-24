import { Module } from '@nestjs/common';
import { Board } from './board.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BoardController } from './board.controller';
import { BoardService } from './board.service';
import { Activity } from 'src/activity/activity.entity';
import { ActivityModule } from 'src/activity/activity.module';

@Module({
    imports: [TypeOrmModule.forFeature([Board, Activity]), ActivityModule],
    controllers: [BoardController],
    providers: [BoardService],
    exports: [TypeOrmModule],
})
export class BoardModule {}
