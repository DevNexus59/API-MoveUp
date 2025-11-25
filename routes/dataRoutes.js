import express from "express";
import { getCoach,getExercises} from "../controllers/dataController.js";
const router = express.Router();

router.get("/coach", getCoach);
router.get("/exercices", getExercises);

export default router;