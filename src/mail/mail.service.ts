import * as nodemailer from "nodemailer";
import { Injectable } from "@nestjs/common";

@Injectable()
export class MailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });
  }

  async sendReminderEmail(to: string, cardTitle: string, dueDate: Date) {
    await this.transporter.sendMail({
      from: `"Trello Clone" <${process.env.MAIL_USER}>`,
      to,
      subject: "⏰ Card Reminder",
      html: `

       < div style = "font-family: Arial, sans-serif; background-color: #f6f8fa; padding: 24px;" >
    <div style="max-width: 480px; margin: auto; background: #ffffff; padding: 24px; border-radius: 8px;" >

    <h2 style="color: #1a73e8; margin-bottom: 16px;" > Reminder for your card

    

    < p style = "font-size: 13px; color: #c90b0bff;" >
        <b>${cardTitle}</b> </strong>.
            </p>
 <p>Due on: ${dueDate.toDateString()}</p>
            < hr style = "border: none; border-top: 1px solid #eee; margin: 24px 0;" />

            <p style= "font-size: 12px; color: #777;" >
                If you did not request this, please ignore this email.
            </p>

                    < p style = "font-size: 12px; color: #777; margin-top: 16px;" >
              — YourApp Security Team
    </p>

    </div>
    </div>
        `,
    });


      //     <h3>Reminder for your card</h3>
      //     <p><b>${cardTitle}</b></p>
      //     <p>Due on: ${dueDate.toDateString()}</p>
      //   `,
  }
}
