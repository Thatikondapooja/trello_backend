import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Checklist } from "src/checklist/checklist.entity";
import { Repository } from "typeorm";
import { ChecklistItem } from "src/checklist/checklist-item.entity";
import { Card } from "src/card/card.entity";

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

    async createChecklist(cardId: number, title: string) {
        const card = await this.cardRepo.findOne({

            where: { id: cardId },
        });
        console.log("card", card)
        if (!card) {
            throw new NotFoundException(`Card ${cardId} not found`);
        }

        const checklist = this.checklistRepo.create({
            title,
            card,
        });

        const saved = await this.checklistRepo.save(checklist);

        return this.checklistRepo.findOne({
            where: { id: saved.id },
            relations: ["card", "items"],   // 🔥 IMPORTANT
        });
    }



    async addItem(checklistId: number, text: string) {
        const checklist = await this.checklistRepo.findOne({
            where: { id: checklistId },
        });
        console.log("ADD ITEM checklistId:", checklistId);

        console.log("checklist", checklist)
        if (!checklist) {
            throw new NotFoundException("Checklist not found");
        }

        const item = this.itemRepo.create({
            text,
            checklist,
        });
        console.log("item", item)

        return this.itemRepo.save(item);
    }

    async toggleItem(itemId: number) {
        const item = await this.itemRepo.findOne({ where: { id: itemId } });
        if (!item) throw new NotFoundException("Item not found");

        item.isCompleted = !item.isCompleted;
        return this.itemRepo.save(item);
    }

    async deleteChecklist(checklistId: number) {
        const checklist = await this.checklistRepo.findOne({
            where: { id: checklistId },
        });

        if (!checklist) {
            throw new NotFoundException("Checklist not found");
        }

        await this.checklistRepo.remove(checklist);

        return { id: checklistId };
    }

}
