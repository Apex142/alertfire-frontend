// src/actions/sendInviteEmail.ts
"use server";
import { EmailService } from "@/app/api/email/EmailService.server";
import { EmailType } from "@/types/enums/EmailType";

type SendInviteEmailParams = {
  to: string;
  data: any;
  subject?: string;
  text?: string;
};

export async function sendInviteEmail({
  to,
  data,
  subject,
  text,
}: SendInviteEmailParams) {
  const emailService = new EmailService();
  await emailService.sendTransactionalEmail(
    EmailType.PROJECT_INVITATION, // ou EmailType.INVITATION si besoin
    to,
    data,
    subject,
    text
  );
}
