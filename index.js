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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = 4000;

// --- Middlewares ---
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

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