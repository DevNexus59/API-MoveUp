import { readCoach } from "../models/coachsModel.js";
import { readExercises } from "../models/exercisesModel.js";

export const getCoach = async (req, res) => {
	try {
		const coachs = await readCoach();
		res.json(coachs);
	} catch (error) {
		console.error("Erreur lecture coach:", error);
		res.status(500).json({ message: "Erreur serveur." });
	}
};

export const getExercises = async (req, res) => {
	try {
		const exercices = await readExercises();
		res.json({ results: exercices });
	} catch (error) {
		console.error("Erreur lecture exercises:", error);
		res.status(500).json({ message: "Erreur serveur." });
	}
};

export const getExerciseId = async (req, res) => {
	const exoToFind = Number(req.params.id);

	try {
		const exercices = await readExercises();
		const exercice = exercices.find((e) => e.id === exoToFind);

		if (!exercice) {
			return res.status(404).send("Exercice non trouvé.");
		}

		res.status(200).json(exercice);
	} catch (error) {
		console.error(error);
		return res
			.statuts(500)
			.send("Erreur serveur lors de la récupération de l'exercice.");
	}
};
