import express from "express";
import { planningUser, savePlanningUser} from "../controllers/planningController.js";
const router = express.Router();

router.get("/users/:id/planning", planningUser);
router.put("/users/:id/planning", savePlanningUser);

export default router;