import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename); 
const filePath = path.join(__dirname, "../data/coach.json");

export const readCoach = async () => {
    try {
        const data = await fs.readFile(filePath, "utf8");
        const Coachs = JSON.parse(data || "[]");
        return Coachs.map((coach) => ({
            ...coach,
            id: Number(coach.id),
        }));
    } catch (error) {
        if (error.code === "ENOENT") {
            return [];
        }
        throw error;
    }
};