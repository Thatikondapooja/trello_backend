import { Module } from '@nestjs/common';
import { ChecklistController } from './checklist.controller';
import { ChecklistService } from './checklist.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Checklist } from './checklist.entity';
import { Card } from 'src/card/card.entity';
import { ChecklistItem } from './checklist-item.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Checklist,ChecklistItem,Card])],
  controllers: [ChecklistController],
  providers: [ChecklistService]
})
export class ChecklistModule {}
