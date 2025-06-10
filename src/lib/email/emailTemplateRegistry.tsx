// src/lib/email/emailTemplateRegistry.ts
import { EmailType } from "@/types/enums/EmailType";

export const emailTemplateRegistry: Record<EmailType, (data: any) => string> = {
  [EmailType.PROJECT_INVITATION]: (data) => `
    <div>
      <h2>Invitation au projet "${data.projectName}"</h2>
      <p>Bonjour ${data.firstName},</p>
      <p>Vous avez été invité(e) à rejoindre le projet <strong>${data.projectName}</strong> en tant que <strong>${data.roleLabel}</strong>.</p>
      <p>À bientôt sur ShowMate !</p>
    </div>
  `,
  [EmailType.PROJECT_INVITATION_PENDING]: (data) => `
    <div>
      <h2>Invitation en attente pour le projet "${data.projectName}"</h2>
      <p>Bonjour ${data.firstName},</p>
      <p>Vous avez été invité(e) à rejoindre le projet <strong>${data.projectName}</strong> en tant que <strong>${data.roleLabel}</strong>.</p>
      <p>
        <a href="${data.acceptUrl}">Cliquez ici pour accepter l'invitation</a>
      </p>
      <p>À bientôt sur ShowMate !</p>
    </div>
  `,
  // Ajoute d'autres templates ici...
};
