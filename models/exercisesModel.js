import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename); 
const filePath = path.join(__dirname, "../data/exercices.json");

export const readExercises = async () => {
	try {
		const data = await fs.readFile(filePath, "utf8");
		const exercises = JSON.parse(data || "[]");
		return exercises.map((exercise) => ({
			...exercise,
			id: Number(exercise.id),
		}));
	} catch (error) {
		if (error.code === "ENOENT") {
			return [];
		}
		throw error;
	}
};