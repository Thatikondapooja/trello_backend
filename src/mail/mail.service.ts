import * as nodemailer from "nodemailer";
import { Injectable } from "@nestjs/common";

@Injectable()
export class MailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true, // Use SSL/TLS
      pool: true,   // Reuse connections
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS, // Standard Gmail App Password
      },
      tls: {
        rejectUnauthorized: false,
      },
      connectionTimeout: 20000,
      greetingTimeout: 20000,
      socketTimeout: 20000,
      logger: true,
      debug: true,
    });
    console.log("MAIL USER:", process.env.MAIL_USER);
    console.log("MAIL PASS EXISTS:", !!process.env.MAIL_PASS);

    this.transporter.verify((error, success) => {
      if (error) {
        console.error("❌ Mail server error:", error);
      } else {
        console.log("✅ Mail server ready");
      }
    });
  }


  async sendReminderEmail(to: string, cardTitle: string, dueDate: Date) {
    console.log("📧 Sending email to:", to);

    await this.transporter.sendMail({
      from: `"Trello Clone" <${process.env.MAIL_USER}>`,
      to,
      subject: "⏰ Card Reminder",
      html: `
  <div style="font-family: Arial, sans-serif; background-color: #f6f8fa; padding: 24px;">
    <div style="max-width: 480px; margin: auto; background: #ffffff; padding: 24px; border-radius: 8px;">
      <h2 style="color: #1a73e8; margin-bottom: 16px;">
        ⏰ Reminder for your card
      </h2>

      <p style="font-size: 14px; color: #333;">
        <b>${cardTitle}</b>
      </p>

      <p>Due on: ${dueDate.toDateString()}</p>

      <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />

      <p style="font-size: 12px; color: #777;">
        This is an automated reminder from Trello Clone.
      </p>
    </div>
  </div>
`
      ,
    });


    //     <h3>Reminder for your card</h3>
    //     <p><b>${cardTitle}</b></p>
    //     <p>Due on: ${dueDate.toDateString()}</p>
    //   `,
  }
}
