import {getAllReviews, createReview} from "../controllers/reviewsController.js";
import express from "express";
const router = express.Router();

router.get("/", getAllReviews);
router.post("/", createReview);

export default router;