import { readUsers, writeUsers } from "../models/userModel.js";
import { readExercises } from "../models/exercisesModel.js";

export const getFavorites = async (req, res) => {try {
    const userId = Number(req.params.id);

    const users = await readUsers();
    const user = users.find((u) => u.id === userId);

    if (!user) {
        return res.status(404).send("Utilisateur non trouvé.");
    }

    const userFavorites = user.favoriteExercices || [];

    const exercicesRaw = await readExercises();
    const allExercises = exercicesRaw;

    const favoritesList = allExercises.filter((exercice) =>
        userFavorites.includes(exercice.exerciseId),
    );
    // ----------------------

    res.json(favoritesList);
} catch (error) {
    console.error("Erreur:", error);
    res.status(500).send("Erreur serveur.");
}
}

export const toggleFavorite = async (req, res) => {const { userId } = req.params;
const { exerciseId } = req.body;

if (!exerciseId) {
    return res
        .status(400)
        .send({ message: "L'ID de l'exercice est manquant." });
}

try {
    const data = await readUsers();
    const users = data;
    let userFound = false;
    const updatedUsers = users.map((user) => {
        if (user.id === Number(userId)) {
            userFound = true;
            if (!user.favoriteExercices) {
                user.favoriteExercices = [];
            }
            const exerciseIndex = user.favoriteExercices.indexOf(exerciseId);

            if (exerciseIndex > -1) {
                user.favoriteExercices.splice(exerciseIndex, 1);
            } else {
                user.favoriteExercices.push(exerciseId);
            }
        }
        return user;
    });
    if (!userFound) {
        return res.status(404).send({ message: "Utilisateur non trouvé." });
    }

    await writeUsers(
        updatedUsers,
    );

    const userToReturn = updatedUsers.find(
        (user) => user.id === Number(userId),
    );

    if (userToReturn) {
        res.status(200).send(userToReturn);
    } else {
        res
            .status(404)
            .send({ message: "Utilisateur non trouvé après mise à jour." });
    }
} catch (error) {
    console.error("Erreur lors de la mise à jour des favoris :", error);
    res.status(500).send({ message: "Erreur du serveur." });
}
}