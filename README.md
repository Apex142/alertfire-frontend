<<<<<<< HEAD
<<<<<<< HEAD
# 🔥 AlertFire – Système intelligent de détection et de gestion d'incendies

**AlertFire** est une plateforme web et embarquée dédiée à la **détection rapide des départs de feu en milieu naturel** et à la **coordination des interventions**.

Le système s'appuie sur des **capteurs physiques (Arduino + capteur de flamme + module LoRa)** déployés sur les arbres, un **modèle d'IA embarqué**, et une **interface web de supervision** pour visualiser en temps réel les alertes, les emplacements et l’évolution du feu.

---

## 🚨 Fonctionnalités principales

- **Détection embarquée des départs de feu**  
  Chaque capteur analyse son environnement localement via un modèle IA léger pour éviter les faux positifs.

- **Communication distribuée via LoRa**  
  Les arbres communiquent entre eux de manière longue portée pour propager les alertes.

- **Carte interactive en temps réel**  
  Visualisez les arbres, leur statut, les foyers détectés et la propagation des alertes.

- **Historique & traçabilité des incendies**  
  Accédez aux historiques d’alertes, journaux de propagation et réponses.

- **Gestion des équipes & des interventions**  
  Assignez des équipes, suivez les actions, localisez les points d'accès critiques.

---

## 🧠 Architecture technique

- **Systèmes embarqués** : Arduino Nano, capteur de flamme, module LoRa E32, IA embarquée avec quantization
- **Backend IA** : Python + scikit-learn (modèle d’apprentissage supervisé léger)
- **Frontend** : Next.js + React + Tailwind CSS + Framer Motion
- **Backend Web** : Node.js (API), Firebase (auth, base, stockage)
- **Communication** : Sérialisation JSON, protocole LoRa optimisé, traitement distribué
- **Déploiement** : Vercel (web), Firebase Hosting, microcontrôleurs autonomes

---

## 🔬 Objectif

Détecter et **signaler automatiquement un départ de feu en moins de 3 secondes**, même en zone sans réseau, grâce à un réseau intelligent d’arbres connectés.

---

## 🧪 État du projet

> ✅ Détection embarquée  
> ✅ Communication inter-arbres  
> ✅ Carte temps réel (frontend)  
> 🚧 Backend coordination multi-zones  
> 🚧 Simulation propagation + alertes en masse  
> 🚧 Interface mobile

---

## 👨‍💻 Auteurs

Projet développé par **Mehdi Martin** et l’équipe AlertFire – Université Aix-Marseille  
Licence 3 Informatique – Projet Système Distribué & IA embarquée
=======
=======
>>>>>>> 5162f9988e78ee543b5f4b76cc6f52b0608733b4
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
<<<<<<< HEAD
>>>>>>> 323df62 (Initial commit from Create Next App)
=======
>>>>>>> 5162f9988e78ee543b5f4b76cc6f52b0608733b4
