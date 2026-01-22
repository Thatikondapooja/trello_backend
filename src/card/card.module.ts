import { Module } from '@nestjs/common';
import { Card } from './card.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { List } from 'src/list/list.entity';
import { CardsService } from './card.service';
import { CardsController } from './card.controller';
import { ActivityModule } from 'src/activity/activity.module';
import { User } from 'src/user/user.entity';
import { CardReminderService } from './card-reminder.service';
import { MailModule } from 'src/mail/mail.module';

@Module({
    imports: [TypeOrmModule.forFeature([Card, List, User]), ActivityModule, MailModule],
    controllers: [CardsController],
    providers: [CardsService, CardReminderService],
    exports: [TypeOrmModule],
})
export class CardModule { }
