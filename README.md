# Showmate 2025

Application de gestion de projets et d'événements pour les professionnels du spectacle.

## 🚀 Fonctionnalités

- 🔐 Authentification sécurisée avec Firebase
- 📅 Gestion de projets et d'événements
- 📍 Gestion des lieux
- 👥 Gestion des équipes et des rôles
- 🎨 Interface moderne et responsive
- 🌙 Mode sombre/clair

## 🛠️ Technologies

- Next.js 14
- React 18
- TypeScript
- Firebase (Authentication, Firestore)
- Tailwind CSS
- Shadcn/ui
- Zustand (State Management)

## 📋 Prérequis

- Node.js 18.17 ou supérieur
- npm ou yarn
- Compte Firebase

## 🚀 Installation

1. Cloner le repository :
```bash
git clone https://github.com/votre-username/showmate-2025.git
cd showmate-2025
```

2. Installer les dépendances :
```bash
npm install
# ou
yarn install
```

3. Configurer les variables d'environnement :
Créer un fichier `.env.local` à la racine du projet avec les variables suivantes :
```env
NEXT_PUBLIC_FIREBASE_API_KEY=votre_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=votre_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=votre_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=votre_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=votre_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=votre_app_id
```

4. Lancer le serveur de développement :
```bash
npm run dev
# ou
yarn dev
```

## 📁 Structure du Projet

```
showmate/
├── src/
│   ├── app/              # Routes et pages Next.js
│   ├── components/       # Composants réutilisables
│   ├── features/         # Fonctionnalités principales
│   ├── hooks/           # Hooks personnalisés
│   ├── lib/             # Utilitaires et configurations
│   ├── stores/          # État global (Zustand)
│   └── types/           # Types TypeScript
├── public/              # Fichiers statiques
└── ...
```

## 🔧 Scripts Disponibles

- `npm run dev` : Lance le serveur de développement
- `npm run build` : Compile l'application pour la production
- `npm run start` : Lance l'application en production
- `npm run lint` : Vérifie le code avec ESLint
- `npm run type-check` : Vérifie les types TypeScript

## 🤝 Contribution

1. Fork le projet
2. Créer une branche pour votre fonctionnalité (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📝 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 👥 Auteurs

- Votre Nom - Développeur Principal

## 🙏 Remerciements

- [Next.js](https://nextjs.org/)
- [Firebase](https://firebase.google.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Shadcn/ui](https://ui.shadcn.com/)