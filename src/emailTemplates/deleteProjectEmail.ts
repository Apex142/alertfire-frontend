// deleteProjectEmail.ts

export function deleteProjectEmailHtml({
  firstName,
  projectName,
}: {
  firstName?: string;
  projectName: string;
}): string {
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Projet supprimé</title>
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
      box-shadow: 0 4px 8px rgba(0,0,0,0.08);
    }
    h1 {
      font-size: 24px;
      color: #dc2626;
      letter-spacing: 0.5px;
    }
    p {
      font-size: 16px;
      line-height: 1.5;
      margin: 16px 0;
    }
    .project-name {
      color: #2563eb;
      font-weight: bold;
    }
    .info-box {
      background: #fef2f2;
      color: #991b1b;
      border-radius: 6px;
      padding: 14px 18px;
      margin: 24px 0 12px 0;
      font-weight: 500;
      font-size: 15px;
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
    <h1>Projet supprimé</h1>
    <p>Bonjour${firstName ? ` ${firstName}` : ""},</p>
    <div class="info-box">
      Le projet <span class="project-name">${projectName}</span> auquel vous participiez a été <strong>supprimé</strong>.
    </div>
    <p>
      Vous ne pouvez plus accéder au contenu ou aux événements de ce projet.<br/>
      Si vous pensez qu'il s'agit d'une erreur, contactez un administrateur.
    </p>
    <footer>
      &copy; ${new Date().getFullYear()} Showmate. Tous droits réservés.
    </footer>
  </div>
</body>
</html>
`;
}
