import { Request, Response, Router } from "express";
import { registerUser, loginUser, renderRegisterPage, renderLoginPage } from "../controllers/authController";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

// pages rendering
router.get('/login', renderLoginPage);
router.get('/register', renderRegisterPage);

export default router;
