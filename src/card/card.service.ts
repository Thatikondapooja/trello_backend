import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Card } from "./card.entity";
import { List } from "../list/list.entity";
import { ActivityService } from "../activity/activity.service";
import { User } from "../user/user.entity";
import { CreateCardDto } from "./CardDto";
import { ReorderCardDto } from "./reorder-card.dto";


@Injectable()
export class CardsService {
   
     
    constructor(
        @InjectRepository(Card)
        private cardRepo: Repository<Card>,

        @InjectRepository(List)
        private listRepo: Repository<List>,

        private activityService: ActivityService,
    ) { }

    async createCard(dto: CreateCardDto, user: User) {
        const list = await this.listRepo.findOne({
            where: { id: dto.listId },
            relations: ["board", "cards"],
        });

        if (!list) {
            throw new NotFoundException("List not found");
        }

        const position = list.cards.length;

        const card = this.cardRepo.create({
            title: dto.title,
            description: dto.description ?? null,
            dueDate: dto.dueDate ?? null,
            labels: dto.label ?? [],
            position,
            list,
        });

        const savedCard = await this.cardRepo.save(card); // ✅ Card, not Card[]

        await this.activityService.log(
            `Card '${savedCard.title}' created in '${list.title}'`,
            list.board,
            user,
        );

        return savedCard;
    }

    async moveCard(cardId: number, toListId: number, user: User) {
        const card = await this.cardRepo.findOne({
            where: { id: cardId },
            relations: ["list", "list.board"],
        });

        if (!card) {
            throw new NotFoundException("Card not found");
        }

        const newList = await this.listRepo.findOne({
            where: { id: toListId },
            relations: ["board"],
        });

        if (!newList) {
            throw new NotFoundException("Target list not found");
        }

        const oldList = card.list;
        card.list = newList;

        const updatedCard = await this.cardRepo.save(card);

        await this.activityService.log(
            `Card '${card.title}' moved from '${oldList.title}' to '${newList.title}'`,
            newList.board,
            user,
        );

        return updatedCard;
    }

    async getCardsByList(listId: number) {
        return this.cardRepo.find({
            where: { list: { id: listId } },
            order: { createdAt: "ASC" },
        });
    }

    async getAllCards() {
        return this.cardRepo.find({
            relations: ["list"],
            order: { createdAt: "ASC" },
        });
    }
    async reorderCards(dto: ReorderCardDto) {
        const { listId, orderedCardIds } = dto;

        for (let i = 0; i < orderedCardIds.length; i++) {
            await this.cardRepo.update(
                { id: orderedCardIds[i], list: { id: listId } },
                { position: i }
            );
        }

        return { success: true };
    }



async getCardById(cardId:number){
    const card=await this.cardRepo.findOne({
        where:{id:cardId},
        relations:["list"],
    })
    if (!card) throw new NotFoundException("Card not found");

    return card;
}

}