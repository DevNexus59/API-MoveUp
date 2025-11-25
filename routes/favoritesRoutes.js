import express from "express";
import { getFavorites, toggleFavorite} from "../controllers/favoriteController.js";
const router = express.Router();

router.get("/users/:id/favorites", getFavorites);
router.patch("/:userId/favorites", toggleFavorite);
export default router;