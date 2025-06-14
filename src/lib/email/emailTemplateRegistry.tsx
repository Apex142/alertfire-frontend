import { addedEmailHtml } from "@/emailTemplates/addedEmail";
import { inviteEmailHtml } from "@/emailTemplates/inviteEmail";
import { memberRemovedEmailHtml } from "@/emailTemplates/memberRemovedEmail";
import { EmailType } from "@/types/enums/EmailType";
import { IEmailTemplate } from "./IEmailTemplate";

export const emailTemplateRegistry: Record<EmailType, IEmailTemplate<any>> = {
  [EmailType.PROJECT_REMOVED]: {
    defaultSubject: ({ projectName }) => `Retrait du projet : ${projectName}`,
    html: memberRemovedEmailHtml,
  },
  [EmailType.PROJECT_INVITATION_PENDING]: {
    defaultSubject: ({ projectName }) => `Invitation au projet ${projectName}`,
    html: inviteEmailHtml,
  },
  [EmailType.PROJECT_ADDED]: {
    defaultSubject: ({ projectName }) => `Ajout au projet : ${projectName}`,
    html: addedEmailHtml,
  },
};
