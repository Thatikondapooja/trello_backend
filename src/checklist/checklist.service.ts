import { Injectable, NotFoundException } from "@nestjs/common";
import { CreateChecklistItemDto } from "./create-checklist-item.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { ChecklistItem } from "./checklist-item.entity";
import { Checklist } from "./checklist.entity";
import { Repository } from "typeorm";
import { Card } from "src/card/card.entity";
import { CreateChecklistDto } from "./create-checklist.dto";

@Injectable()
export class ChecklistService {
    constructor(
        @InjectRepository(Checklist)
        private checklistRepo: Repository<Checklist>,

        @InjectRepository(ChecklistItem)
        private itemRepo: Repository<ChecklistItem>,

        @InjectRepository(Card)
        private cardRepo: Repository<Card>,
    ) { }

    async createChecklist(dto: CreateChecklistDto) {
        const card = await this.cardRepo.findOne({
            where: { id: dto.cardId },
        });

        if (!card) throw new NotFoundException("Card not found");

        const checklist = this.checklistRepo.create({
            title: dto.title,
            card,
        });

        return this.checklistRepo.save(checklist);
    }

    async addItem(dto: CreateChecklistItemDto) {
        const checklist = await this.checklistRepo.findOne({
            where: { id: dto.checklistId },
        });

        if (!checklist) throw new NotFoundException("Checklist not found");

        const item = this.itemRepo.create({
            text: dto.text,
            checklist,
        });

        return this.itemRepo.save(item);
    }

    async toggleItem(itemId: number) {
        const item = await this.itemRepo.findOne({ where: { id: itemId } });
        if (!item) throw new NotFoundException("Item not found");

        item.isCompleted = !item.isCompleted;
        return this.itemRepo.save(item);
    }
}
