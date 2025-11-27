import express from "express";
import { login,register,forgotPassword,resetPassword,googleLogin,getMe,logout} from "../controllers/authController.js";
const router = express.Router();

router.post("/login", login);
router.post("/register", register);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/google-login", googleLogin);
router.get("/getme", getMe);
router.post("/logout", logout);

export default router;