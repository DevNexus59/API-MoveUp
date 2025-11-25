import { readUsers,writeUsers } from "../models/userModel.js";


export const planningUser = async (req, res) => {
	const userId = Number(req.params.id);

	try {
		const users = await readUsers();
		const user = users.find((u) => u.id === userId);

		if (!user) {
			return res.status(404).json({ message: "Utilisateur non trouvé." });
		}

		if (!user.planning) {
			user.planning = [];
		}

		res.json({ events: user.planning });
	} catch (error) {
		console.error("Erreur planning du get:", error);
		res.status(500).json({ message: "Erreur serveur." });
	}
}

export const savePlanningUser = async (req, res) => {
	const userId = Number(req.params.id);
	const { events } = req.body; //cela permet d'attendre le tableau events

	try {
		const users = await readUsers();
		const userIndex = users.findIndex((u) => u.id === userId);

		if (userIndex === -1) {
			return res.status(404).json({ message: "Utilisateur non trouvé." });
		}

		if (!Array.isArray(events)) {
			return res
				.status(400)
				.json({ message: "Le format de l'event est invalide." });
		}

		users[userIndex].planning = events;

		await writeUsers(users);
		res.json({ events: users[userIndex].planning });
	} catch (error) {
		console.error("erreur du planning put", error);
		res.status(500).send("erreur planning");
	}
}