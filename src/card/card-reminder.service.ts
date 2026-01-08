import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Card } from "./card.entity";
import { MailService } from "src/mail/mail.service";
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
            console.log({
                cardId: card.id,
                dueDate: card.dueDate,
                reminderMinutes: card.reminderMinutes,
                reminderSent: card.reminderSent,
            });

            const reminderTime = new Date(
                card.dueDate.getTime() - card.reminderMinutes * 60 * 1000
            );

            console.log({
                now: now.toString(),
                due: card.dueDate.toString(),
                reminderTime: reminderTime.toString(),
            });

           
            if (
                now >= reminderTime &&
                now <= new Date(reminderTime.getTime() + 60000)
            ) {
                const email=card.list.board.owner.email
                console.log("email", email)
                // 📧 SEND EMAIL
                await this.mailService.sendReminderEmail(
                    card.list.board.owner.email,
                    card.title,
                    card.dueDate
                );

                card.reminderSent = true;
                await this.cardRepo.save(card);
            }
        }
    }
}
