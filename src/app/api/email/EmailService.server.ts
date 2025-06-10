import { EmailType } from "@/types/enums/EmailType";
import { emailTemplateRegistry } from "@/lib/email/emailTemplateRegistry";
import nodemailer from "nodemailer";

// Provider Nodemailer adapté server only
class NodemailerProvider {
  private transporter: any;
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
  async send(options: {
    to: string;
    subject: string;
    html: string;
    text: string;
  }) {
    const fromName = process.env.SMTP_FROM_NAME || "ShowMate";
    const fromEmail = process.env.SMTP_FROM_EMAIL!;
    await this.transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    });
  }
}

export class EmailService {
  private provider: NodemailerProvider;
  constructor(provider?: NodemailerProvider) {
    this.provider = provider || new NodemailerProvider();
  }

  async sendTransactionalEmail(
    type: EmailType,
    recipientEmail: string,
    data: any,
    subject?: string,
    text?: string
  ) {
    const templateFn = emailTemplateRegistry[type];
    if (!templateFn) {
      throw new Error(`Email template pour le type "${type}" non trouvé.`);
    }
    const html = templateFn(data);
    const finalSubject =
      subject ?? `Invitation au projet ${data.projectName || ""}`;
    const finalText = text ?? html.replace(/<[^>]+>/g, "");
    await this.provider.send({
      to: recipientEmail,
      subject: finalSubject,
      html,
      text: finalText,
    });
  }
}
