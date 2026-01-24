import { Injectable } from "@nestjs/common";
import * as https from "https";
import * as nodemailer from "nodemailer";

@Injectable()
export class MailService {
  private transporter: any;

  constructor() {
    // Only initialize SMTP if we are NOT using the SendGrid API
    if (!process.env.SENDGRID_API_KEY && process.env.MAIL_USER) {
      this.transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASS,
        },
      });
      console.log("🚀 Mail Service (SMTP Fallback Mode) Initialized");
    } else {
      console.log("🚀 Mail Service (SendGrid API Mode) Initialized");
    }
  }

  async sendReminderEmail(to: string, cardTitle: string, dueDate: Date) {
    const apiKey = process.env.SENDGRID_API_KEY;

    // --- MODE 1: SENDGRID API (Best for Production/Render) ---
    if (apiKey) {
      console.log("📧 Sending email via SendGrid API to:", to);
      this.sendViaSendGrid(apiKey, to, cardTitle, dueDate);
      return;
    }

    // --- MODE 2: GMAIL SMTP (Best for Local Development) ---
    if (this.transporter) {
      console.log("📧 Sending email via Gmail SMTP to:", to);
      try {
        await this.transporter.sendMail({
          from: `"Trello Clone" <${process.env.MAIL_USER}>`,
          to,
          subject: "⏰ Card Reminder",
          html: this.getHtmlContent(cardTitle, dueDate),
        });
        console.log("✅ Email sent successfully via SMTP");
      } catch (error) {
        console.error("❌ SMTP Error:", error);
      }
      return;
    }

    console.error("❌ No email configuration found (Need SENDGRID_API_KEY or MAIL_USER/PASS)");
  }

  private sendViaSendGrid(apiKey: string, to: string, cardTitle: string, dueDate: Date) {
    const data = JSON.stringify({
      personalizations: [{ to: [{ email: to }] }],
      from: { email: "thatikondapooja888@gmail.com", name: "Trello Clone" },
      subject: "⏰ Card Reminder",
      content: [{ type: "text/html", value: this.getHtmlContent(cardTitle, dueDate) }],
    });

    const options = {
      hostname: "api.sendgrid.com",
      port: 443,
      path: "/v3/mail/send",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "Content-Length": data.length,
      },
    };

    const req = https.request(options, (res) => {
      if (res.statusCode === 202) {
        console.log("✅ Email sent successfully via SendGrid API");
      } else {
        console.error(`❌ SendGrid API Error: ${res.statusCode}`);
      }
    });

    req.on("error", (err) => console.error("❌ API Connection Error:", err));
    req.write(data);
    req.end();
  }

  private getHtmlContent(cardTitle: string, dueDate: Date) {
    return `
      <div style="font-family: Arial, sans-serif; background-color: #f6f8fa; padding: 24px;">
        <div style="max-width: 480px; margin: auto; background: #ffffff; padding: 24px; border-radius: 8px; border: 1px solid #e1e4e8;">
          <h2 style="color: #1a73e8; margin-bottom: 16px;">⏰ Reminder for your card</h2>
          <p style="font-size: 16px; color: #333; font-weight: bold;">${cardTitle}</p>
          <p style="color: #586069;">Due on: ${dueDate.toDateString()}</p>
          <hr style="border: none; border-top: 1px solid #eaecef; margin: 24px 0;" />
          <p style="font-size: 12px; color: #6a737d;">This is an automated reminder from Trello Clone.</p>
        </div>
      </div>
    `;
  }
}
