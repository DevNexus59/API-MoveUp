import { readBadges } from "../models/badgeModel.js";
import { readUsers, writeUsers } from "../models/userModel.js";
import moment from "moment";

function checkComplexAchievements(
    exerciseData,
    newlyUnlocked,
    user,
    badgesList,
) {
    const now = moment();
    const hour = now.hour();
    const minute = now.minute();

    // Vérification de Régularité
    if (user.lastWorkoutDate) {
        const lastDate = moment(user.lastWorkoutDate).startOf("day");
        const diffDays = now.startOf("day").diff(lastDate, "days");

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
    user.exercisesCounts[exerciseData.exerciseId] =
        (user.exercisesCounts[exerciseData.exerciseId] || 0) + 1;
    user.exercisesTriedCount = Object.keys(user.exercisesTried).length;
    user.maxExerciseCount = Math.max(0, ...Object.values(user.exercisesCounts));

    const logicBadges = badgesList.filter((b) => b.type === "LOGIC");

    logicBadges.forEach((badge) => {
        const isAlreadyUnlocked = user.unlockedBadges.includes(badge.id);
        let conditionMet = false;

        if (
            badge.metric === "exercisesTriedCount" ||
            badge.metric === "maxExerciseCount"
        ) {
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

function checkAndUnlockBadges(user, exerciseData, badgesList) {
    const newlyUnlocked = [];
    user.totalExercisesCompleted = (user.totalExercisesCompleted || 0) + 1;

    if (!user.unlockedBadges) user.unlockedBadges = [];
    if (!user.exercisesTried) user.exercisesTried = {};
    if (!user.exercisesCounts) user.exercisesCounts = {};

    //Contrôle du cumul pour badges de Progression
    badgesList
        .filter((b) => b.type !== "LOGIC")
        .forEach((badge) => {
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

export const trackAchievements =async (req, res) => {
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
};

export const getAllBadges = async (req, res) => {try {
    const badges = await readBadges();
    res.json(badges);
} catch (error) {
    console.error("Erreur lecture badge:", error);
    res.status(500).json({ message: "Erreur serveur." });
}
}
export const getUserBadges = async (req, res) => {
	try {
		const [users, badges] = await Promise.all([readUsers(), readBadges()]);

		const user = users.find((u) => u.id === Number(req.params.userId));

		if (!user) {
			return res.status(404).json({ message: "Utilisateur non trouvé." });
		}

		// Recupérer les détails des badges
		const userBadgeIds = user.unlockedBadges || [];
		const unlockedDetails = userBadgeIds
			.map((badgeId) => badges.find((b) => b.id === badgeId))
			.filter(Boolean);

		res.json(unlockedDetails);
	} catch (error) {
        console.error("Erreur déblocage badge:", error);
		res.status(500).json({ message: "Erreur serveur." });
	}
}