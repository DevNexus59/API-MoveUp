import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename); 
const filePath = path.join(__dirname, "../data/users.json");

export const readUsers = async () => {
	try {
		const data = await fs.readFile(filePath, "utf8");
		const users = JSON.parse(data || "[]");
		return users.map((user) => ({
			...user,
			id: Number(user.id),
		}));
	} catch (error) {
		if (error.code === "ENOENT") {
			return [];
		}
		throw error;
	}
};
export const writeUsers = async (users) => {
	await fs.writeFile(filePath, JSON.stringify(users, null, 2));
};