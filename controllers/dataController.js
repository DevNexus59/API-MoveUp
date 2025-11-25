import { readCoach } from "../models/coachsModel.js"
import { readExercises } from "../models/exercisesModel.js";

export const getCoach = async (req,res) => {
    try {
        const coachs = await readCoach();
        res.json( coachs );
    } catch (error) {
        console.error("Erreur lecture coach:", error);
        res.status(500).json({ message: "Erreur serveur." });
    }
} ;

export const getExercises = async (req,res) => {
	try {
		const exercices = await readExercises();
		res.json({ results: exercices });
	} catch (error) {
		console.error("Erreur lecture exercises:", error);
		res.status(500).json({ message: "Erreur serveur." });
	}
};   