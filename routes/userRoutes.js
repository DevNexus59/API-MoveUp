import {getAllUsers, getOneUser, updateUser, deleteUser} from "../controllers/userController.js";
import {upload} from "../middlewares/multerMiddleware.js";
import express from "express";
const router = express.Router();

router.get("/", getAllUsers);
router.get("/:id", getOneUser);
router.patch("/:id", upload.single("photo"), updateUser);
router.delete("/:id", deleteUser);

export default router;