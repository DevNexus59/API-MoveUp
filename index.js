import "dotenv/config";

import userRoutes from "./routes/userRoutes.js";
import reviewsRoutes from "./routes/reviewsRoutes.js";
import badgesRoutes from "./routes/badgesRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import planningRoutes from "./routes/planningRoutes.js";
import favoritesRoutes from "./routes/favoritesRoutes.js";
import DataRoutes from "./routes/dataRoutes.js";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = 3000;

// --- Middlewares ---
app.use(
	cors({
		origin: ["https://moveup.pierrefourdin.dev", "http://localhost:3000"], // VOTRE PORT EXACT DU FRONTEND
		methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
		credentials: true,
	}),
);
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser());

// --- Montage des Routes MVC ---
app.use("/api/users", userRoutes);
app.use("/api/reviews", reviewsRoutes);
app.use("/api", badgesRoutes);
app.use("/api/auth", authRoutes);
app.use("/api", planningRoutes);
app.use("/api", favoritesRoutes);
app.use("/api", DataRoutes);

// ✅ Lancement du serveur
app.listen(PORT, () => {
	console.log(`🤖 Serveur API lancé sur http://localhost:${PORT}`);
});