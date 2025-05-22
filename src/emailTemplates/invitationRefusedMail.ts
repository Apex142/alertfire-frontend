export function invitationRefusedEmailHtml({
  firstName,
  projectName,
  invitedUserName,
}: {
  firstName?: string;
  projectName: string;
  invitedUserName: string;
}) {
  return `
  <!DOCTYPE html>
  <html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Invitation refusée</title>
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
        font-size: 22px;
        color: #1e293b;
      }
      p {
        font-size: 16px;
        line-height: 1.5;
        margin: 16px 0;
      }
      .btn {
        display: inline-block;
        padding: 10px 22px;
        background-color: #2563eb;
        color: white;
        text-decoration: none;
        border-radius: 6px;
        font-weight: 600;
        margin-top: 20px;
      }
      .btn:hover {
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
      <h1>Invitation refusée</h1>
      <p>Bonjour${firstName ? ` ${firstName}` : ""},</p>
      <p>
        <b>${invitedUserName}</b> a refusé votre invitation à rejoindre le projet <b>${projectName}</b>.
      </p>
      <p>
        Vous pouvez inviter un autre membre depuis votre espace projet si besoin.<br>
        <a href="${
          process.env.NEXT_PUBLIC_URL || "https://showmate.app"
        }/project" class="btn">Voir mes projets</a>
      </p>
      <footer>
        &copy; ${new Date().getFullYear()} Showmate. Tous droits réservés.
      </footer>
    </div>
  </body>
  </html>
  `;
}
