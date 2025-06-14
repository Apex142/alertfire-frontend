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
