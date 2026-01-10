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

            const reminderTime = new Date(Date.now() - 60_000);
            console.log("reminderTime", reminderTime)

            console.log({
                cardId: card.id,
                nowUTC: now.toISOString(),
                dueUTC: card.dueDate.toISOString(),
                reminderUTC: reminderTime.toISOString(),
            });

            // ✅ CORRECT CONDITION (NO TIME WINDOW)
            if (now >= reminderTime && !card.reminderSent) {
                await this.mailService.sendReminderEmail(
                    card.list.board.owner.email,
                    card.title,
                    card.dueDate
                );

                card.reminderSent = true;
                await this.cardRepo.save(card);

                console.log("✅ Reminder email sent for card:", card.id);
            }
        }}}