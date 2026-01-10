import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Checklist } from "./checklist.entity";
import { ChecklistItem } from "./checklist-item.entity";
import { ChecklistService } from "./checklist.service";
import { ChecklistController } from "./checklist.controller";
import { Card } from "src/card/card.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([Checklist, ChecklistItem, Card]),
  ],
  controllers: [ChecklistController], // 🔥 REQUIRED
  providers: [ChecklistService],
})
export class ChecklistModule { }
