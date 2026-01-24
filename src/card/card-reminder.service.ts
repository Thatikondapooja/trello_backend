import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Card } from "./card.entity";
import { MailService } from "../mail/mail.service";
import { Cron } from "@nestjs/schedule";

@Injectable()
export class CardReminderService {
    constructor(
        @InjectRepository(Card)
        private cardRepo: Repository<Card>,
        private mailService: MailService,
    ) { }

    @Cron("* * * * *") // every minute
    async sendReminders() {
        const now = new Date();
        console.log("NOW:", new Date().toISOString());

        // const cards = await this.cardRepo.find({
        //     relations: [
        //         "list",
        //         "list.board",
        //         "list.board.owner",], // 🔥 IMPORTANT
        //     where: {
        //         reminderSent: false,
        //     },
        // });

        const cards = await this.cardRepo
            .createQueryBuilder("card")
            .leftJoinAndSelect("card.list", "list")
            .leftJoinAndSelect("list.board", "board")
            .leftJoinAndSelect("board.owner", "owner") // ✅ THIS IS THE KEY
            .where("card.reminderSent = false")
            .getMany();


        for (const card of cards) {
            if (!card.dueDate || !card.reminderMinutes) continue;
            if (!card.list?.board?.owner?.email) continue;

            const reminderMinutes = card.reminderMinutes || 0;
            const timeToRemind = new Date(card.dueDate.getTime() - (reminderMinutes * 60 * 1000));

            console.log({
                cardId: card.id,
                title: card.title,
                now: now.toISOString(),
                due: card.dueDate.toISOString(),
                remindAt: timeToRemind.toISOString(),
                alreadySent: card.reminderSent
            });

            if (now >= timeToRemind && !card.reminderSent) {
                console.log("🚀 Sending reminder for:", card.title);
                await this.mailService.sendReminderEmail(
                    card.list.board.owner.email,
                    card.title,
                    card.dueDate
                );

                card.reminderSent = true;
                await this.cardRepo.save(card);
                console.log("✅ Reminder sent and marked in DB");
            }
        }
    }
}