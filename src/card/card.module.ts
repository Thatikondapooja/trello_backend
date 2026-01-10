import { Module } from '@nestjs/common';
import { Card } from './card.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { List } from 'src/list/list.entity';
import { CardsService } from './card.service';
import { CardsController } from './card.controller';
import { ActivityModule } from 'src/activity/activity.module';
import { User } from 'src/user/user.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Card, List,User]), ActivityModule],
    controllers:[CardsController],
    providers:[CardsService],
    exports:[TypeOrmModule],
})
export class CardModule {}
