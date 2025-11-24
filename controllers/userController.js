import { readUsers, writeUsers } from "../models/userModel.js";

export const getAllUsers = async (req, res) => {
	try {
		const users = await readUsers();

		// Logique métier : on retire les mots de passe
		const usersWithoutPasswords = users.map((user) => {
			const { password, ...userData } = user;
			return userData;
		});

		res.status(200).json(usersWithoutPasswords);
	} catch (error) {
		console.error("Erreur...", error);
		return res.status(500).send("Erreur serveur.");
	}
};

export const getOneUser = async (req, res) => {
    const idToFind = Number(req.params.id);

	try {
		const users = await readUsers();
		const user = users.find((u) => u.id === idToFind);

		if (!user) {
			return res.status(404).send("Utilisateur non trouvé.");
		}

		if (!user.planning) {
			user.planning = [];
		}

		const { password, ...userData } = user;

		res.status(200).json(userData);
	} catch (error) {
		console.error(error);
		return res
			.status(500)
			.send("Erreur serveur lors de la récupération de l'utilisateur.");
	}
};

export const updateUser = async (req, res) => {
    
    const idChanged = Number(req.params.id);
	const newData = req.body;

	if (req.file) {
		const webPath = req.file.path.replace(/\\/g, "/").replace("public/", "/");
		newData.photoUrl = webPath;
	}

	try {
		let users = await readUsers();
		const userIndex = users.findIndex((u) => u.id === idChanged);

		if (userIndex === -1) {
			return res.status(404).send("Utilisateur non trouvé.");
		}

		users[userIndex] = {
			...users[userIndex],
			...newData,
			id: users[userIndex].id,
		};

		await writeUsers(users);
		const updatedUser = users[userIndex];
		updatedUser.id = Number(updatedUser.id);
		res.status(200).json(users[userIndex]);
	} catch (error) {
		console.error("Erreur dans le PATCH /api/users:", error); // 🚩 Vérifiez ce log !
		return res.status(500).send("Erreur serveur lors de la mise à jour.");
	}
};

export const deleteUser = async (req, res) => {const idDelete = Number(req.params.id);

	try {
		let users = await readUsers();
		const userExists = users.some((u) => u.id === idDelete);

		if (!userExists) {
			return res.status(404).send("Utilisateur non trouvé.");
		}

		const newUsers = users.filter((u) => u.id !== idDelete);

		await writeUsers(newUsers);
		res.status(200).send("Suppression effectuée avec succès !");
	} catch (error) {
		console.error(error);
		return res.status(500).send("Erreur serveur lors de la suppression.");
	}
};