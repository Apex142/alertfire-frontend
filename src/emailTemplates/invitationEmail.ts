export function invitationEmailHtml({
  firstName,
  projectName,
  roleLabel,
  acceptUrl,
}: {
  firstName: string;
  projectName: string;
  roleLabel: string;
  acceptUrl: string;
}): string {
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Invitation au project</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background: #f9fafb;
      margin: 0; padding: 20px;
      color: #333;
    }
    .container {
      max-width: 600px;
      margin: auto;
      background: white;
      border-radius: 8px;
      padding: 30px;
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }
    h1 {
      font-size: 24px;
      color: #111827;
    }
    p {
      font-size: 16px;
      line-height: 1.5;
      margin: 16px 0;
    }
    a.button {
      display: inline-block;
      padding: 12px 24px;
      background-color: #2563eb;
      color: white;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      margin-top: 20px;
    }
    a.button:hover {
      background-color: #1d4ed8;
    }
    footer {
      font-size: 12px;
      color: #6b7280;
      margin-top: 30px;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Invitation au project</h1>
    <p>Bonjour ${firstName || "Utilisateur"},</p>
    <p>Vous avez été invité à rejoindre le project <strong>${projectName}</strong> en tant que <strong>${roleLabel}</strong>.</p>
    <p>Cliquez sur le bouton ci-dessous pour accepter l'invitation :</p>
    <a href="${acceptUrl}" class="button" target="_blank" rel="noopener noreferrer">Accepter l'invitation</a>
    <p>Si vous n'avez pas demandé cette invitation, vous pouvez ignorer cet email.</p>
    <footer>
      &copy; ${new Date().getFullYear()} Showmate. Tous droits réservés.
    </footer>
  </div>
</body>
</html>
`;
}
