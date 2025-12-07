MoveUp API
API backend pour l'application MoveUp - plateforme de coaching sportif et gestion d'entraînements.
📋 Description
MoveUp est une API REST développée avec Node.js et Express qui permet de gérer :

Authentification des utilisateurs (classique et Google OAuth)
Gestion des profils utilisateurs
Catalogue d'exercices et de coachs
Système de favoris
Planning d'entraînements personnalisé
Suivi des achievements et badges
Avis et évaluations

🚀 Technologies utilisées

Node.js & Express 5.1.0
bcrypt - Hashage des mots de passe
jsonwebtoken - Authentification JWT
Google Auth Library - OAuth Google
Nodemailer - Envoi d'emails
Multer - Upload de fichiers
Moment.js - Gestion des dates
CORS - Gestion des requêtes cross-origin

📦 Installation

Cloner le repository

bashgit clone https://github.com/minisquall59/api-auth.git
cd api-auth

Installer les dépendances

bashnpm install

Créer un fichier .env à la racine du projet (voir .exemple.env)

envJWT_SECRET=votre_super_secret_key_unique_et_difficile_a_deviner
CLIENT_ID=votre_client_id_google
EMAIL_USER=votre_email
EMAIL_PASS=votre_mot_de_passe_application

Lancer le serveur en mode développement

bashnpm run dev
```

Le serveur démarre sur `http://localhost:4000`

## 📁 Structure du projet
```
api-auth/
├── controllers/          # Logique métier
│   ├── authController.js
│   ├── badgeController.js
│   ├── dataController.js
│   ├── favoriteController.js
│   ├── planningController.js
│   ├── reviewsController.js
│   └── userController.js
├── models/              # Accès aux données
│   ├── badgeModel.js
│   ├── coachsModel.js
│   ├── exercisesModel.js
│   ├── reviewModel.js
│   └── userModel.js
├── routes/              # Définition des routes
├── middlewares/         # Middlewares (multer)
├── data/               # Fichiers JSON (base de données)
│   ├── users.json
│   ├── exercices.json
│   ├── coach.json
│   ├── badges.json
│   └── reviews.json
└── public/             # Fichiers statiques (images)
🛣️ Routes API
Authentification (/api/auth)

POST /login - Connexion
POST /register - Inscription
POST /google-login - Connexion Google
POST /forgot-password - Demande de réinitialisation
POST /reset-password - Réinitialisation du mot de passe
GET /getme - Récupérer l'utilisateur connecté
POST /logout - Déconnexion

Utilisateurs (/api/users)

GET / - Liste des utilisateurs
GET /:id - Détails d'un utilisateur
PATCH /:id - Modifier un utilisateur (avec upload photo)
DELETE /:id - Supprimer un utilisateur

Exercices (/api)

GET /exercices - Liste des exercices
GET /exercices/:id - Détails d'un exercice
GET /coach - Liste des coachs

Favoris (/api)

GET /users/:id/favorites - Liste des favoris d'un utilisateur
PATCH /:userId/favorites - Ajouter/retirer un favori

Planning (/api)

GET /users/:id/planning - Planning d'un utilisateur
PUT /users/:id/planning - Sauvegarder le planning

Badges (/api)

GET /badges - Liste de tous les badges
GET /users/:userId/badges - Badges débloqués par un utilisateur
POST /achievements/track - Enregistrer une progression

Avis (/api/reviews)

GET / - Liste des avis
POST / - Créer un avis

🔐 Authentification
L'API utilise :

JWT stocké dans un cookie HTTP-only
Google OAuth pour la connexion sociale
Bcrypt pour le hashage des mots de passe

🎯 Système de badges
L'application propose un système de gamification avec :

Badges de progression : basés sur le nombre d'exercices complétés
Badges de régularité : jours consécutifs d'entraînement
Badges horaires : lève-tôt, noctambule
Badges de diversité : explorer différents exercices

Types de badges :

PROGRESSION : débloqués selon des seuils cumulatifs
LOGIC : débloqués selon des conditions complexes

📧 Fonctionnalités email

Réinitialisation de mot de passe par email
Configuration via Nodemailer avec Gmail

🖼️ Upload de fichiers

Photos de profil utilisateur
Stockage dans /public/images
Gestion via Multer

🔧 Configuration CORS
javascript{
  origin: "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  credentials: true
}
🗃️ Base de données
Utilise des fichiers JSON pour le stockage :

users.json - Utilisateurs
exercices.json - 55 exercices variés
coach.json - 10 coachs
badges.json - 12 badges
reviews.json - Avis clients

👥 Données utilisateurs
Chaque utilisateur peut avoir :

Informations personnelles (nom, email, adresse, téléphone)
Type d'utilisateur (Personnel/Professionnel)
Niveau d'expérience
Régime alimentaire
Abonnement
Photo de profil
Exercices favoris
Planning personnalisé
Badges débloqués
Statistiques d'entraînement

🏃 Exercices
55 exercices disponibles avec :

GIF animé
Instructions détaillées
Muscles ciblés
Équipement requis
Durée
Difficulté
Type d'activité (musculation, cardio, étirement, gainage)

🎖️ Badges disponibles

Premier Pas (1 exercice)
Assidu (50 exercices)
Héros (100 exercices)
Semaine Parfaite (7 jours consécutifs)
Mois Parfait (30 jours consécutifs)
Lève-tôt (10 séances avant 7h)
Noctambule (10 séances après 22h)
Touche à tout (5 exercices différents)
Explorateur (10 exercices différents)
Spécialiste (50 fois le même exercice)
10 Minutes (600 secondes cumulées)
2 Heures (7200 secondes cumulées)

📝 Scripts disponibles
bashnpm run dev    # Lancer en mode développement avec nodemon
npm test       # Tests (non configurés)
🤝 Contributeurs
Projet développé dans le cadre d'une formation
📄 Licence
ISC
🔗 Liens

Repository : https://github.com/minisquall59/api-auth
Issues : https://github.com/minisquall59/api-auth/issues
