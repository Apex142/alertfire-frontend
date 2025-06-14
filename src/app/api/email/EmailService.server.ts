/* lib/email/EmailService.server.ts */
import { IEmailTemplate } from "@/lib/email/IEmailTemplate";
import { emailTemplateRegistry } from "@/lib/email/emailTemplateRegistry";
import { EmailType } from "@/types/enums/EmailType";
import { NodemailerProvider } from "./NodemailerProvider";

export class EmailService {
  constructor(
    private provider: NodemailerProvider = new NodemailerProvider()
  ) {}

  /**
   * Envoie n'importe quel email transactionnel.
   * @param type   Type d'email (clé du registry)
   * @param to     Destinataire
   * @param data   Données passées au template
   * @param overrides  Permet d'écraser sujet / html / texte
   */
  async sendTransactionalEmail<Data = unknown>(
    type: EmailType,
    to: string,
    data: Data,
    overrides?: Partial<{
      subject: string;
      html: string;
      text: string;
    }>
  ): Promise<void> {
    const template: IEmailTemplate<Data> | undefined =
      emailTemplateRegistry[type];
    if (!template) {
      throw new Error(`Template non défini pour le type « ${type} ».`);
    }

    /* Génère contenu à partir du template */
    const html = overrides?.html ?? template.html(data);
    const subject = overrides?.subject ?? template.defaultSubject(data);
    const text =
      overrides?.text ??
      template.text?.(data) ??
      // Fallback : strip HTML tags
      html.replace(/<[^>]+>/g, "");

    await this.provider.sendMail({ to, subject, html, text });
  }
}
