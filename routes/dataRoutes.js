import express from "express";
import {
	getCoach,
	getExercises,
	getExerciseId,
} from "../controllers/dataController.js";
const router = express.Router();

router.get("/coach", getCoach);
router.get("/exercices", getExercises);
router.get("/exercices/:id", getExerciseId);

export default router;
