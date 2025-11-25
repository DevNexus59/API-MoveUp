import express from "express";
import {
	getAllBadges,
	getUserBadges,
	trackAchievements,
} from "../controllers/badgeController.js";
const router = express.Router();

router.get("/badges", getAllBadges);
router.get("/users/:userId/badges", getUserBadges);
router.post("/achievements/track", trackAchievements);

export default router;