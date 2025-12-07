<div align="center">

# 🏋️ MoveUp API

### Plateforme de coaching sportif et gestion d'entraînements

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.1.0-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![License](https://img.shields.io/badge/License-ISC-blue?style=for-the-badge)](LICENSE)

[Fonctionnalités](#-fonctionnalités) • [Installation](#-installation) • [API](#-api-endpoints) • [Documentation](#-documentation)

---

</div>

## 📋 Description

**MoveUp** est une API REST complète développée avec Node.js et Express qui permet de gérer une plateforme de coaching sportif avec :

- 🔐 **Authentification sécurisée** (classique + Google OAuth)
- 👤 **Gestion des profils** utilisateurs
- 💪 **Catalogue d'exercices** (55 exercices disponibles)
- 👨‍🏫 **10 coachs professionnels**
- ⭐ **Système de favoris**
- 📅 **Planning personnalisé**
- 🏆 **Badges et achievements** (12 badges)
- 💬 **Avis et évaluations**

---

## ✨ Fonctionnalités

<table>
<tr>
<td width="50%">

### 🔑 Authentification
- ✅ Inscription/Connexion classique
- ✅ OAuth Google
- ✅ JWT (stocké en cookie HTTP-only)
- ✅ Réinitialisation de mot de passe par email
- ✅ Hashage sécurisé (bcrypt)

</td>
<td width="50%">

### 👤 Gestion Utilisateurs
- ✅ Profils personnalisés
- ✅ Upload de photo de profil
- ✅ Types : Personnel/Professionnel
- ✅ Niveaux d'expérience
- ✅ Régimes alimentaires
- ✅ Statistiques d'entraînement

</td>
</tr>
<tr>
<td width="50%">

### 💪 Exercices
- ✅ 55 exercices variés
- ✅ GIFs animés
- ✅ Instructions détaillées
- ✅ Muscles ciblés
- ✅ Durée et difficulté
- ✅ Catégories (musculation, cardio, gainage, étirement)

</td>
<td width="50%">

### 🏆 Gamification
- ✅ 12 badges déblocables
- ✅ Badges de progression
- ✅ Badges de régularité
- ✅ Badges horaires
- ✅ Badges de diversité
- ✅ Suivi des statistiques

</td>
</tr>
</table>

---

## 🚀 Installation

### Prérequis

- Node.js >= 18
- npm >= 6

### Étapes d'installation

```bash
# 1. Cloner le repository
git clone https://github.com/minisquall59/api-auth.git
cd api-auth

# 2. Installer les dépendances
npm install

# 3. Configurer les variables d'environnement
cp .exemple.env .env
# Éditer .env avec vos propres valeurs

# 4. Lancer le serveur en mode développement
npm run dev
```

Le serveur démarre sur **`http://localhost:4000`** 🚀

---

## 🔧 Configuration

Créez un fichier `.env` à la racine avec les variables suivantes :

```env
JWT_SECRET=votre_super_secret_key_unique_et_difficile_a_deviner
CLIENT_ID=votre_client_id_google
EMAIL_USER=votre_email
EMAIL_PASS=votre_mot_de_passe_application
```

### Configuration CORS

```javascript
{
  origin: "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  credentials: true
}
```

---

## 📁 Structure du Projet

```
api-auth/
├── 📂 controllers/          # Logique métier
│   ├── authController.js
│   ├── badgeController.js
│   ├── dataController.js
│   ├── favoriteController.js
│   ├── planningController.js
│   ├── reviewsController.js
│   └── userController.js
│
├── 📂 models/              # Accès aux données
│   ├── badgeModel.js
│   ├── coachsModel.js
│   ├── exercisesModel.js
│   ├── reviewModel.js
│   └── userModel.js
│
├── 📂 routes/              # Définition des routes
│   ├── authRoutes.js
│   ├── badgesRoutes.js
│   ├── dataRoutes.js
│   ├── favoritesRoutes.js
│   ├── planningRoutes.js
│   ├── reviewsRoutes.js
│   └── userRoutes.js
│
├── 📂 middlewares/         # Middlewares (multer)
│   └── multerMiddleware.js
│
├── 📂 data/                # Base de données JSON
│   ├── users.json
│   ├── exercices.json
│   ├── coach.json
│   ├── badges.json
│   └── reviews.json
│
├── 📂 public/              # Fichiers statiques
│   └── images/
│
└── 📄 index.js             # Point d'entrée
```

---

## 🛣️ API Endpoints

### 🔐 Authentification `/api/auth`

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `POST` | `/login` | Connexion utilisateur |
| `POST` | `/register` | Inscription |
| `POST` | `/google-login` | Connexion via Google OAuth |
| `POST` | `/forgot-password` | Demande de réinitialisation |
| `POST` | `/reset-password` | Réinitialisation du mot de passe |
| `GET` | `/getme` | Récupérer l'utilisateur connecté |
| `POST` | `/logout` | Déconnexion |

### 👤 Utilisateurs `/api/users`

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/` | Liste des utilisateurs |
| `GET` | `/:id` | Détails d'un utilisateur |
| `PATCH` | `/:id` | Modifier un utilisateur (+ upload photo) |
| `DELETE` | `/:id` | Supprimer un utilisateur |

### 💪 Exercices `/api`

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/exercices` | Liste des exercices |
| `GET` | `/exercices/:id` | Détails d'un exercice |
| `GET` | `/coach` | Liste des coachs |

### ⭐ Favoris `/api`

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/users/:id/favorites` | Liste des favoris d'un utilisateur |
| `PATCH` | `/:userId/favorites` | Ajouter/retirer un favori |

### 📅 Planning `/api`

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/users/:id/planning` | Planning d'un utilisateur |
| `PUT` | `/users/:id/planning` | Sauvegarder le planning |

### 🏆 Badges `/api`

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/badges` | Liste de tous les badges |
| `GET` | `/users/:userId/badges` | Badges débloqués par un utilisateur |
| `POST` | `/achievements/track` | Enregistrer une progression |

### 💬 Avis `/api/reviews`

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/` | Liste des avis |
| `POST` | `/` | Créer un avis |

---

## 🏆 Système de Badges

### Types de badges

#### 📈 Badges de Progression (PROGRESSION)
- 🥉 **Premier Pas** - 1 exercice complété
- 🥈 **Assidu** - 50 exercices complétés
- 🥇 **Héros** - 100 exercices complétés

#### ⏱️ Badges de Régularité (LOGIC)
- 📅 **Semaine Parfaite** - 7 jours consécutifs
- 📆 **Mois Parfait** - 30 jours consécutifs

#### 🕐 Badges Horaires (LOGIC)
- 🌅 **Lève-tôt** - 10 séances avant 7h
- 🌙 **Noctambule** - 10 séances après 22h

#### 🎯 Badges de Diversité (LOGIC)
- 🎨 **Touche à tout** - 5 exercices différents
- 🗺️ **Explorateur** - 10 exercices différents
- 🎓 **Spécialiste** - 50 fois le même exercice

#### ⏲️ Badges de Durée (LOGIC)
- ⏱️ **10 Minutes** - 600 secondes cumulées
- ⏰ **2 Heures** - 7200 secondes cumulées

---

## 💻 Technologies Utilisées

<div align="center">

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)
![Google OAuth](https://img.shields.io/badge/Google_OAuth-4285F4?style=for-the-badge&logo=google&logoColor=white)
![Nodemailer](https://img.shields.io/badge/Nodemailer-0078D4?style=for-the-badge&logo=mail.ru&logoColor=white)

</div>

### Dépendances principales

| Package | Version | Description |
|---------|---------|-------------|
| `express` | 5.1.0 | Framework web |
| `bcrypt` | 6.0.0 | Hashage des mots de passe |
| `jsonwebtoken` | 9.0.2 | Authentification JWT |
| `google-auth-library` | 10.5.0 | OAuth Google |
| `nodemailer` | 7.0.10 | Envoi d'emails |
| `multer` | 2.0.2 | Upload de fichiers |
| `moment` | 2.30.1 | Gestion des dates |
| `cors` | 2.8.5 | Gestion CORS |

---

## 📊 Données

### 👥 Utilisateurs

Chaque utilisateur peut avoir :
- Informations personnelles (nom, email, adresse, téléphone)
- Type d'utilisateur (Personnel/Professionnel)
- Niveau d'expérience (Débutant/Intermédiaire/Expert)
- Régime alimentaire (Sans restriction, Végétarien, Vegan, etc.)
- Abonnement (Gratuit/Premium/Pro)
- Photo de profil
- Exercices favoris
- Planning personnalisé
- Badges débloqués
- Statistiques d'entraînement

### 💪 Exercices (55 disponibles)

Chaque exercice contient :
- GIF animé
- Instructions détaillées
- Muscles ciblés
- Équipement requis
- Durée
- Difficulté (Facile/Intermédiaire/Difficile)
- Type d'activité (Musculation/Cardio/Gainage/Étirement)

### 👨‍🏫 Coachs (10 disponibles)

- Nom et prénom
- Adresse et coordonnées
- Photo de profil
- Spécialités
- Présentation

---

## 📝 Scripts Disponibles

```bash
# Mode développement avec nodemon
npm run dev

# Tests (non configurés)
npm test
```

---

## 🔒 Sécurité

- ✅ Mots de passe hashés avec **bcrypt** (10 rounds)
- ✅ JWT stockés dans des cookies **HTTP-only**
- ✅ Validation des entrées utilisateur
- ✅ Protection CORS configurée
- ✅ Variables d'environnement sensibles dans `.env`
- ✅ Tokens d'expiration (1h pour JWT, 15min pour reset password)

---

## 🤝 Contributeurs

Projet développé dans le cadre d'une formation en développement web.

---

## 📄 Licence

ISC

---

## 🔗 Liens

- 📦 [Repository GitHub](https://github.com/minisquall59/api-auth)
- 🐛 [Signaler un bug](https://github.com/minisquall59/api-auth/issues)

---

<div align="center">

### 💪 Fait avec passion pour le sport et le code

⭐ **N'oubliez pas de star le projet si vous l'aimez !** ⭐

</div>
