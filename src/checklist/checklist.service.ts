import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Card } from "src/card/card.entity";
import { Repository } from "typeorm";
import { Checklist } from "./checklist.entity";

@Injectable()
export class ChecklistService {
    constructor(
        @InjectRepository(Checklist)
        private checklistRepo: Repository<Checklist>,

        @InjectRepository(Card)
        private cardRepo: Repository<Card>,
    ) { }

    async createChecklist(cardId: number, title: string) {
        const card = await this.cardRepo.findOne({
            where: { id: cardId },
        });

        if (!card) {
            throw new NotFoundException("Card not found");
        }

        const checklist = this.checklistRepo.create({
            title,
            card,
        });

        return this.checklistRepo.save(checklist);
    }
}
