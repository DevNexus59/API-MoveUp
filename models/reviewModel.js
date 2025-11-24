import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename); 
const filePath = path.join(__dirname, "../data/reviews.json");

export const readReviews = async () => {
	try {
		const data = await fs.readFile(filePath, "utf8");
		return JSON.parse(data || "[]");
	} catch (error) {
		if (error.code === "ENOENT") {
			return [];
		}
		throw error;
	}
};

export const writeReviews = async (allReviews) => {
    await fs.writeFile(
        filePath,
        JSON.stringify(allReviews, null, 2),
        "utf-8"
    );
};