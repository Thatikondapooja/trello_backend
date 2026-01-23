import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Checklist } from "src/checklist/checklist.entity";
import { ChecklistItem } from "src/checklist/checklist-item.entity";
import { ChecklistService } from "src/checklist/checklist.service";
import { ChecklistController } from "src/checklist/checklist.controller";
import { Card } from "src/card/card.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([Checklist, ChecklistItem, Card]),
  ],
  controllers: [ChecklistController], // 🔥 REQUIRED
  providers: [ChecklistService],
})
export class ChecklistModule { }
