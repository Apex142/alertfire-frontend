/* lib/email/NodemailerProvider.ts */
import nodemailer, { Transporter } from "nodemailer";

export class NodemailerProvider {
  private transporter: Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: { rejectUnauthorized: false },
    });
  }

  async sendMail(opts: {
    to: string;
    subject: string;
    html: string;
    text: string;
  }) {
    const fromName = process.env.SMTP_FROM_NAME ?? "ShowMate";
    const fromEmail = process.env.SMTP_FROM_EMAIL!;
    await this.transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      ...opts,
    });
  }
}
