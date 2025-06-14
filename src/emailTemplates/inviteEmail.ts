// emailTemplates/inviteEmailHtml.ts
/**
 * G gère l’email d’invitation à un projet.
 */
export function inviteEmailHtml({
  firstName,
  projectName,
  roleLabel,
  acceptUrl,
}: {
  firstName?: string;
  projectName: string;
  roleLabel: string;
  acceptUrl: string;
}) {
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Invitation à un projet</title>
  <style>
    body { font-family: Arial, sans-serif; background:#f9fafb; margin:0; padding:20px; color:#333; }
    .container { max-width:600px; margin:auto; background:#fff; border-radius:8px; padding:30px; box-shadow:0 4px 8px rgba(0,0,0,0.08); }
    h1 { font-size:22px; color:#2563eb; letter-spacing:0.5px; }
    p  { font-size:16px; line-height:1.5; margin:16px 0; }
    .project-name { color:#2563eb; font-weight:bold; }
    .role-label   { background:#eff6ff; color:#1d4ed8; border-radius:4px; padding:2px 6px; font-weight:600; }
    .cta-btn { display:inline-block; margin-top:20px; background:#2563eb; color:#fff !important; text-decoration:none; padding:12px 20px; border-radius:6px; font-size:15px; }
    footer { font-size:12px; color:#6b7280; margin-top:30px; text-align:center; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Invitation à rejoindre un projet</h1>

    <p>Bonjour${firstName ? ` ${firstName}` : ""},</p>

    <p>
      Vous avez été invité(e) à rejoindre le projet
      <span class="project-name">${projectName}</span>
      en tant que <span class="role-label">${roleLabel}</span>.
    </p>

    <p>Cliquez sur le bouton ci-dessous pour accepter l’invitation&nbsp;:</p>

    <p style="text-align:center;">
      <a href="${acceptUrl}" class="cta-btn">Accepter l’invitation</a>
    </p>

    <p>
      Si le bouton ne fonctionne pas, copiez/collez ce lien dans votre
      navigateur&nbsp;:<br />
      <a href="${acceptUrl}">${acceptUrl}</a>
    </p>

    <footer>
      &copy; ${new Date().getFullYear()} Showmate. Tous droits réservés.
    </footer>
  </div>
</body>
</html>
`;
}
