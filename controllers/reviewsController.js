import { readReviews, writeReviews } from "../models/reviewModel.js";

export const getAllReviews = async (req, res) => {
    try {
		const reviews = await readReviews();
		res.json(reviews);
	} catch (error) {
		console.error("Erreur lors de la sauvegarde de l'avis:", error);
		res.status(500).send("Erreur serveur");
	}
};

export const createReview = async (req, res) => {
    try {
		const { userId, rating, comment, title } = req.body;
		const newId = Date.now();
		const newCreatedAt = new Date().toISOString();
		const newReview = {
			id: newId,
			userId: userId,
			title: title,
			rating: rating,
			comment: comment,
			createdAt: newCreatedAt,
		};
		const allReviews = await readReviews();
		allReviews.push(newReview);
		await writeReviews(allReviews);
		res.status(201).json(newReview);
	} catch (error) {
		console.error("Erreur lors de la sauvegarde de l'avis:", error);
		res.status(500).send("Erreur serveur");
	}
};