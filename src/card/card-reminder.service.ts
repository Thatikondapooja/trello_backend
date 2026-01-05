import { Injectable } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Not, IsNull } from "typeorm";
import { Card } from "./card.entity";

@Injectable()
export class CardReminderService {
    constructor(
        @InjectRepository(Card)
        private cardRepo: Repository<Card>,
    ) { }

    @Cron("* * * * *") // runs every minute
    async checkReminders() {
        const now = new Date();

        const cards = await this.cardRepo.find({
            where: {
                dueDate: Not(IsNull()),
                reminderMinutes: Not(IsNull()),
                reminderSent: false,
            },
        });

        for (const card of cards) {
            if (!card.dueDate || card.reminderMinutes ==null){
                continue;
            }
            // ✅ THIS IS WHERE YOUR LINE GOES
            const reminderTime = new Date(
                card.dueDate.getTime() - card.reminderMinutes * 60 * 1000
            );

            if (now >= reminderTime) {
                console.log(`🔔 Reminder: ${card.title}`);

                card.reminderSent = true;
                await this.cardRepo.save(card);
            }
        }
    }
}
