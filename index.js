require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const moment = require('moment');
const fs = require('fs').promises; // Utilisation de la version Promise de fs
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const { OAuth2Client } = require('google-auth-library');
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/images/');
  },

  filename: function (req, file, cb) {
    const nameWithoutExt = path.basename(file.originalname, path.extname(file.originalname));
    const extension = path.extname(file.originalname);
    const timestampphoto = Date.now()
    const finalName = `${nameWithoutExt}-${timestampphoto}${extension}`
    cb(null, finalName);
  }});
const upload = multer({ storage: storage });
const exercices = require('./exercices.json');
const coachs = require('./coach.json');
const app = express();
const PORT = 4000;
const filePath = path.join(__dirname, 'users.json');
const JWT_SECRET = process.env.JWT_SECRET || 'secret_fallback';
const CLIENT_ID = process.env.CLIENT_ID || 'idclient_fallback';
const client = new OAuth2Client(CLIENT_ID);


app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Fonction utilitaire pour lire les utilisateurs
const readUsers = async () => {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    const users = JSON.parse(data || '[]');
    return users.map(user => ({
        ...user,
        id: Number(user.id)
    }));
  } catch (error) {
    // Si le fichier n'existe pas, on retourne un tableau vide
    if (error.code === 'ENOENT') {
      return [];
    }
    // Pour les autres erreurs, on les propage
    throw error;
  }
};
const readReviews = async () => {
  try {
    const data = await fs.readFile('reviews.json', 'utf8');
    return JSON.parse(data || '[]');
  } catch (error) {
    // Si le fichier n'existe pas, on retourne un tableau vide
    if (error.code === 'ENOENT') {
      return [];
    }
    // Pour les autres erreurs, on les propage
    throw error;
  }
};

// Fonction utilitaire pour écrire les utilisateurs
const writeUsers = async (users) => {
  await fs.writeFile(filePath, JSON.stringify(users, null, 2));
};

// 🎖️Fonction utilitaire pour les badges🎖️
const readBadges = async () => {
  try {
    const data = await fs.readFile('badges.json', 'utf8');
    return JSON.parse(data || '{}');
  } catch (error) {
    if (error.code === 'ENOENT') return {}; // Si pas de fichier, objet vide
    throw error;
  }
};


// Vérification des Achievements

function checkComplexAchievements(exerciseData, newlyUnlocked, user, badgesList) {
    const now = moment();
    const hour = now.hour();
    const minute = now.minute();

    // Vérification de Régularité
    if (user.lastWorkoutDate) {
        const lastDate = moment(user.lastWorkoutDate).startOf('day');
        const diffDays = now.startOf('day').diff(lastDate, 'days');

        if (diffDays === 1) {
            user.consecutiveDays += 1;
        } else if (diffDays > 1) {
            user.consecutiveDays = 1;
        }
    } else {
        user.consecutiveDays = 1;
    }
    user.lastWorkoutDate = now.toISOString();

    // Vérification Horaire
    if (hour < 7) user.totalEarlyWorkouts = (user.totalEarlyWorkouts || 0) + 1;
    if (hour >= 22) user.totalLateWorkouts = (user.totalLateWorkouts || 0) + 1;
    if (minute > 10) user.timeAchieved = (user.timeAchieved || 0) + 1;
    if (hour === 2) user.timeAchieved = (user.timeAchieved || 0) + 1;

    // Vérification Diversité
    if (!user.exercisesTried) user.exercisesTried = {};
    if (!user.exercisesCounts) user.exercisesCounts = {};

    // Mise a jour pour les badges type LOGIC
    user.exercisesTried[exerciseData.exerciseId] = true;
    user.exercisesCounts[exerciseData.exerciseId] = (user.exercisesCounts[exerciseData.exerciseId] || 0) +1;
    user.exercisesTriedCount = Object.keys(user.exercisesTried).length;
    user.maxExerciseCount = Math.max(0, ...Object.values(user.exercisesCounts));

    const logicBadges = badgesList.filter(b => b.type === 'LOGIC'); 

    logicBadges.forEach(badge => {
        const isAlreadyUnlocked = user.unlockedBadges.includes(badge.id);
        let conditionMet = false;

        if (badge.metric === 'exercisesTriedCount' || badge.metric === 'maxExerciseCount') {
            conditionMet = user[badge.metric] >= badge.requiredValue;
        } else if (user[badge.metric] !== undefined) {
            conditionMet = user[badge.metric] >= badge.requiredValue;
        }

        if (conditionMet && !isAlreadyUnlocked) {
            user.unlockedBadges.push(badge.id);
            newlyUnlocked.push(badge);
        }
    });
}

// Controle la réalisation d'un exo, les metrics et les achievements.
function checkAndUnlockBadges(user, exerciseData, badgesList) {
    const newlyUnlocked = [];
    user.totalExercisesCompleted = (user.totalExercisesCompleted || 0) +1;

    if (!user.unlockedBadges) user.unlockedBadges = [];
    if (!user.exercisesTried) user.exercisesTried = {};
    if (!user.exercisesCounts) user.exercisesCounts = {};
  

    //Contrôle du cumul pour badges de Progression
    badgesList.filter(b => b.type !== 'LOGIC').forEach(badge =>{
        const isAlreadyUnlocked = user.unlockedBadges.includes(badge.id);
        const conditionMet = (user[badge.metric] || 0) >= badge.requiredValue;

        if (conditionMet && !isAlreadyUnlocked) {
            user.unlockedBadges.push(badge.id);
            newlyUnlocked.push(badge);
        }
    });
    //Contrôle des badges de type temporel et de diversité
    checkComplexAchievements(exerciseData, newlyUnlocked, user, badgesList);

    return newlyUnlocked;
}

// Route de lecture des utilisateurs
app.get('/api/users', async (req, res) => {
  try {
    const users = await readUsers();
    
 
    const usersWithoutPasswords = users.map(user => {

      const { password, ...userData } = user;
      return userData;
    });
    
    res.status(200).json(usersWithoutPasswords);
  } catch (error) {
    console.error("Erreur lors de la récupération de la liste d'utilisateurs:", error);
    return res.status(500).send('Erreur serveur.');
  }
});

// Route de lecture des Favoris
app.get('/api/users/:id/favorites', async (req, res) => {
  try {
    const userId = Number(req.params.id);
    
    const users = await readUsers();
    const user = users.find(u => u.id === userId);
    
    if (!user) {
      return res.status(404).send('Utilisateur non trouvé.');
    }
    
    const userFavorites = user.favoriteExercices || [];

    const exercicesRaw = await fs.readFile('exercices.json', 'utf8');
    const allExercises = JSON.parse(exercicesRaw);

    const favoritesList = allExercises.filter(exercice => 
        userFavorites.includes(exercice.exerciseId)
    );
    // ----------------------

    res.json(favoritesList);

  } catch (error) {
    console.error("Erreur:", error);
    res.status(500).send('Erreur serveur.');
  }
});

// 📍 NOUVELLE ROUTE : Récupérer un utilisateur par son ID
app.get('/api/users/:id', async (req, res) => {
  const idToFind = Number(req.params.id);

  try {
    const users = await readUsers();
    const user = users.find(u => u.id === idToFind);

    if (!user) {
      return res.status(404).send('Utilisateur non trouvé.');
    }

    if (!user.planning) {
        user.planning = [];
    }

    const { password, ...userData } = user;

    res.status(200).json(userData);

  } catch (error) {
    console.error(error);
    return res.status(500).send('Erreur serveur lors de la récupération de l\'utilisateur.');
  }
});
// ✅ Route d’inscription
app.post('/subscription', async (req, res) => {
  const { name, firstname, address, zipcode, city, phone, email, usertype, levelexperiency, timerequired, diet, subscription, PaymentMethod, password } = req.body;

  if (!email || !password) {
    return res.status(400).send('Email et mot de passe sont requis.');
  }

  try {
    const users = await readUsers();

    if (users.find(user => user.email === email)) {
      return res.status(400).send('Cet email est déjà utilisé.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      id: users.length ? users[users.length - 1].id + 1 : 1,
      name,
      firstname,
      address,
      zipcode,
      city,
      phone,
      email,
      password: hashedPassword,
      usertype,
      levelexperiency,
      timerequired,
      diet,
      subscription,
      PaymentMethod,
    };

    users.push(newUser);
    await writeUsers(users);

    res.status(201).send('Utilisateur créé avec succès !');

  } catch (error) {
    console.error(error);
    return res.status(500).send('Erreur serveur lors de l\'inscription.');
  }
});

// ✅ Route de mise à jour
app.patch('/api/users/:id', upload.single('photo'), async (req, res) => {
  const idChanged = Number(req.params.id);
  const newData = req.body; 
  
 if (req.file) { 
    const webPath = req.file.path.replace(/\\/g, '/').replace('public/', '/');
    newData.photoUrl = webPath; 
}

  try {

    let users = await readUsers();
    const userIndex = users.findIndex(u => u.id === idChanged);

    if (userIndex === -1) {
      return res.status(404).send('Utilisateur non trouvé.');
    }

    users[userIndex] = { ...users[userIndex], ...newData, id: users[userIndex].id };

    await writeUsers(users);
    const updatedUser = users[userIndex];
    updatedUser.id = Number(updatedUser.id);
    res.status(200).json(users[userIndex]);

  } catch (error) {
    console.error("Erreur dans le PATCH /api/users:", error); // 🚩 Vérifiez ce log !
    return res.status(500).send('Erreur serveur lors de la mise à jour.');
  }
});

// ✅ Route de suppression
app.delete('/api/users/:id', async (req, res) => {
  const idDelete = Number(req.params.id);

  try {
    let users = await readUsers();
    const userExists = users.some(u => u.id === idDelete);

    if (!userExists) {
      return res.status(404).send('Utilisateur non trouvé.');
    }

    const newUsers = users.filter(u => u.id !== idDelete);

    await writeUsers(newUsers);
    res.status(200).send('Suppression effectuée avec succès !');

  } catch (error) {
    console.error(error);
    return res.status(500).send('Erreur serveur lors de la suppression.');
  }
});

// ✅ Route de connexion
app.post('/connexion', async (req, res) => {
  const { email, password } = req.body;

  try {
    const users = await readUsers();
    const user = users.find(u => u.email === email);

    if (!user) {
      return res.status(404).send('Email ou mot de passe incorrect.');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).send('Email ou mot de passe incorrect.');
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({ message: 'Connexion réussie !', token, userId: user.id, userFirstName: user.firstname || null });

  } catch (err) {
    console.error(err);
    return res.status(500).send('Erreur serveur lors de la connexion.');
  }
});

// 🧩 route transmission d'information d'exercices.json
app.get('/api/exercices', async (req, res) => {
  res.json({results: exercices });
});

// ✅ Route Google Callback
app.post('/api/auth/google-login', async (req, res) => {
  const { credential } = req.body;
  try {
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    const userEmail = payload.email;
    const userName = payload.name;
    
    let users = await readUsers();
    let user = users.find(u => u.email === userEmail);

    if (user) {
      console.log("Utilisateur trouvé (Connexion):", user.email);
    } else {
      console.log("Nouvel utilisateur (Inscription):", userEmail);
      const newUser = {
        id: users.length ? users[users.length - 1].id + 1 : 1,
        email: userEmail,
        name: userName,
        adresse: null,
        phone: null
      };
      users.push(newUser);
      await writeUsers(users);
      user = newUser;
    }

    const notreToken = jwt.sign(
      { id: user.id, email: user.email }, 
      JWT_SECRET,                     
      { expiresIn: '1h' }             
    );

    res.json({ token: notreToken });

  } catch (error) {
    console.error("Échec de l'authentification Google", error);
    res.status(401).json({ error: "Authentification échouée" });
  }
});
// 📍 NOUVELLE ROUTE : Toggle Favorite
app.patch('/api/:userId/favorites', async (req, res) => {

  const {userId} = req.params;
  const { exerciseId } = req.body;

  if(!exerciseId) {
    return res.status(400).send({ message: "L'ID de l'exercice est manquant."});
  }

  try {
    const data = await fs.readFile('users.json', 'utf8');
    let users = JSON.parse(data)
    let userFound = false;
    const updatedUsers = users.map(user => {
      if (user.id === Number(userId)) {
        userFound = true;
          if (!user.favoriteExercices) {
            user.favoriteExercices = [];
          }
          const exerciseIndex = user.favoriteExercices.indexOf(exerciseId);

          if (exerciseIndex > -1) {
            user.favoriteExercices.splice(exerciseIndex, 1)
          } else {
            user.favoriteExercices.push(exerciseId);
          }
      }
      return user;
    });
    if (!userFound) {
      return res.status(404).send({ message: "Utilisateur non trouvé." })
    }

    await fs.writeFile('users.json', JSON.stringify(updatedUsers, null,2), 'utf-8');

    const userToReturn = updatedUsers.find((user) => user.id === Number(userId))

    if (userToReturn) {
    res.status(200).send(userToReturn);
    } else {
    
    res.status(404).send({ message: "Utilisateur non trouvé après mise à jour." });
    }

  } catch (error) {
      console.error("Erreur lors de la mise à jour des favoris :", error);
      res.status(500).send({ message: "Erreur du serveur." });
  }
});
// 📍 NOUVELLE ROUTE : post Reviews
app.post('/api/reviews', async (req, res) => {
  
  try {

    const { userId, rating, comment, title } = req.body;
    const newId = Date.now(); 
    const newCreatedAt = new Date().toISOString();
    const newReview = {
      id: newId,
      userId: userId,
      title: title,
      rating: rating,
      comment: comment,
      createdAt: newCreatedAt
    }
    const allReviews = await readReviews();
    allReviews.push(newReview);
    await fs.writeFile('reviews.json', JSON.stringify(allReviews, null, 2), 'utf-8');
    res.status(201).json(newReview);

  } catch (error) {
    console.error("Erreur lors de la sauvegarde de l'avis:", error);
    res.status(500).send("Erreur serveur");
  }
});
// 📍 NOUVELLE ROUTE :  lire Reviews 
app.get('/api/reviews', async (req, res) => {
  
  try {

    const reviews = await readReviews(); 
    res.json(reviews);

  } catch (error) {
    console.error("Erreur lors de la sauvegarde de l'avis:", error);
    res.status(500).send("Erreur serveur");
  }
});


// 📍Routes pour les badges🎖️

// 📍Lister les badges dispos
app.get('/api/badges', async (req, res) => {
  try {
    const badges = await readBadges();
    res.json(badges);
  }
  catch (error) {
    console.error ("Erreur lecture badge:", error);
    res.status (500).json({message:"Erreur serveur."});
  }
});

// 📍lister les badges débloqués par un user
app.get('/api/users/:userId/badges', async (req, res) => {
  try {
    const [users, badges] = await Promise.all([readUsers(), readBadges()]);
    
    const user = users.find(u => u.id === Number(req.params.userId));
    
    if(!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé.'});
    }
    
    // Recupérer les détails des badges
    const userBadgeIds = user.unlockedBadges || [];
    const unlockedDetails = userBadgeIds.map(badgeId => badges.find(b => b.id === badgeId)).filter(Boolean);
    
    res.json(unlockedDetails);
  } catch (error) {
    res.status(500).json({message: "Erreur serveur."});
  }
});

// 📍Enregistre la réalisation des exos
app.post('/api/achievements/track', async(req, res) => {
  const {userId, exerciseId, duration} = req.body;
  
  if (!userId || !exerciseId || duration === undefined) {
    return res.status(400).json({message: 'Donnees manquantes.'});
  }
  
  try {
    const [users, badges] = await Promise.all([readUsers(), readBadges()]);
    const userIdNumber = Number(userId);
    const userIndex = users.findIndex(u=> u.id === userIdNumber);
    if (userIndex === -1) {
      return res.status(404).json({message: 'Utilisteur non trouvé.'});
    }

    const user = users[userIndex];
      if (!user.unlockedBadges) user.unlockedBadges = [];
      if (!user.totalExercisesCompleted) user.totalExercisesCompleted = 0;
      if (!user.totalEarlyWorkouts) user.totalEarlyWorkouts = 0;
      if (!user.totalLateWorkouts) user.totalLateWorkouts = 0;
      if (!user.consecutiveDays) user.consecutiveDays = 0;
      if (!user.exercisesCounts) user.exercisesCounts = {};
      if (!user.timeAchieved) user.timeAchieved = 0;

      user.timeAchieved = (user.timeAchieved || 0) + Number(duration);
      user.totalExercisesCompleted = (user.totalExercisesCompleted || 0) + 1;

    const newlyUnlocked = checkAndUnlockBadges(users[userIndex], {exerciseId}, badges);
    await writeUsers(users);
    
    res.json({
      status: 'success',
      newlyUnlockedBadges : newlyUnlocked,
      userStats: {
        totalExercises: users[userIndex].totalExercisesCompleted,
        consecutiveDays: users[userIndex].consecutiveDays,
        timeAchieved: users[userIndex].timeAchieved,
        totalEarlyWorkouts: users[userIndex].totalEarlyWorkouts,
        totalLateWorkouts: users[userIndex].totalLateWorkouts
      }
    });
  } catch (error) {
    console.error("Erreur lors du traitement de l'exercice:", error);
    res.status(500).json({message: 'Erreur interne du serveur.', error: error.message});
  }
});

// 🧩 Route de lecture des Coachs Favoris
app.get('/api/coach', async (req, res) => {
  res.json({coachs });
});
// 📍Routes pour le planning

// 📍Renvoie les seances planifiees:

app.get("/api/users/:id/planning", async (req, res) => {
  const userId = Number(req.params.id);

  try {
    const users = await readUsers();
    const user = users.find((u) => u.id === userId);

    if (!user) {
      return res.status(404).json({message: 'Utilisateur non trouvé.'});
    }

    if (!user.planning) {
      user.planning = [];
    }

    res.json({ events: user.planning});
  } catch (error) {
    console.error("Erreur planning du get:", error);
    res.status(500).json( {message:"Erreur serveur."});
  }
});

// 📍Sauvegarde les seances planifiees:

app.put("/api/users/:id/planning", async (req, res) => {
  const userId = Number(req.params.id);
  const { events } = req.body; //cela permet d'attendre le tableau events

  try{
    const users = await readUsers();
    const userIndex = users.findIndex((u) => u.id === userId);

      if (userIndex === -1) {
      return res.status(404).json({message: 'Utilisateur non trouvé.'});
    }

    if (!Array.isArray(events)) {
      return res.status(400).json({message:"Le format de l'event est invalide."});
    }

    users[userIndex].planning = events;

    await writeUsers(users);
    res.json({events: users[userIndex].planning});
  } catch (error) {
    console.error("erreur du planning put", error);
    res.status(500).send("erreur planning");
  }
});

// ✅ Lancement du serveur
app.listen(PORT, () => {
  console.log(`🤖 Serveur API lancé sur http://localhost:${PORT}`);
});
