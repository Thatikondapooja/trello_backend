import { Module } from '@nestjs/common';
import { List } from './list.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Board } from 'src/board/board.entity';
import { ListsService } from './list.service';
import { ListsController } from './list.controller';
import { ActivityModule } from 'src/activity/activity.module';

@Module({
    imports: [TypeOrmModule.forFeature([List, Board]), ActivityModule],
    controllers: [ListsController],
    providers: [ListsService],
    exports: [TypeOrmModule],
})
export class ListModule {}
