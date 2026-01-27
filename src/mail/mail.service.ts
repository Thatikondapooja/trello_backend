import { Injectable } from "@nestjs/common";
import * as https from "https";
import * as nodemailer from "nodemailer";
import { OtpPurpose } from "src/otp/otp.entity";

@Injectable()
export class MailService {
 private transporter;  
  

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

  async sendReminderEmail(to: string, cardTitle: string, dueDate: Date): Promise<boolean> {
    const apiKey = process.env.SENDGRID_API_KEY;

    // --- MODE 1: SENDGRID API (Best for Production/Render) ---
    if (apiKey) {
      console.log("📧 Sending email via SendGrid API to:", to);
      return this.sendViaSendGrid(apiKey, to, cardTitle, dueDate);
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
        return true;
      } catch (error) {
        console.error("❌ SMTP Error:", error);
        return false;
      }
    }

    console.error("❌ No email configuration found (Need SENDGRID_API_KEY or MAIL_USER/PASS)");
    return false;
  }

  private sendViaSendGrid(apiKey: string, to: string, cardTitle: string, dueDate: Date): Promise<boolean> {
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
        "Content-Length": Buffer.byteLength(data),
      },
    };

    return new Promise((resolve) => {
      const req = https.request(options, (res) => {
        let responseBody = "";
        res.on("data", (chunk) => { responseBody += chunk; });

        res.on("end", () => {
          if (res.statusCode === 202) {
            console.log("✅ Email sent successfully via SendGrid API");
            resolve(true);
          } else {
            console.error(`❌ SendGrid API Error: ${res.statusCode}`);
            console.error(`❌ Reason: ${responseBody}`);
            resolve(false);
          }
        });
      });

      req.on("error", (err) => {
        console.error("❌ API Connection Error:", err);
        resolve(false);
      });

      req.write(data);
      req.end();
    });
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



  async sendOtpEmail(to: string, otp: string, purpose: OtpPurpose) {
    if (!to) throw new Error('Recipient email is required');

    const subject =
      purpose === OtpPurpose.FORGOT_PASSWORD
        ? 'Reset Your Password – OTP Code'
        : 'Verify Your Email – OTP Code';
    console.log("purpose", purpose)
    const message =
      purpose === OtpPurpose.FORGOT_PASSWORD
        ? `
            <p style="font-size: 14px; color: #333;">
            This password Reset email from Trello clone.
                You requested to reset your password. Use the OTP below to continue.
            </p>
        `
        : `
            <p style="font-size: 14px; color: #333;">
                Use the following One-Time Password (OTP) to complete your sign-in.
            </p>
        `;
    console.log(" purpose === OtpPurpose.FORGOT_PASSWORD", purpose)

    await this.transporter.sendMail({
      from: `"YourApp Security" <${process.env.MAIL_USER}>`,
      to,
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #f6f8fa; padding: 24px;">
          <div style="max-width: 480px; margin: auto; background: #ffffff; padding: 24px; border-radius: 8px;">
            
            <h2 style="color: #1a73e8; margin-bottom: 16px;">${purpose === OtpPurpose.FORGOT_PASSWORD ? 'Password Reset OTP' : 'Login Verification'
        }</h2>

            ${message}

            <div style="
              font-size: 28px;
              font-weight: bold;
              letter-spacing: 6px;
              text-align: center;
              margin: 24px 0;
              color: #111;
            ">
              ${otp}
            </div>

            <p style="font-size: 13px; color: #c90b0bff;">
              This OTP is valid for <strong>5 minutes</strong>.
            </p>

            <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />

            <p style="font-size: 12px; color: #777;">
              If you did not request this, please ignore this email.
            </p>

            <p style="font-size: 12px; color: #777; margin-top: 16px;">
              — YourApp Security Team
            </p>

          </div>
        </div>
        `,
    });

    console.log(`OTP email sent to ${to} with purpose: ${purpose}`);
  }
}
