import { Router } from "express";
import { authMiddleware, verifyRole } from "../middlewares/authMiddleware";

const router = Router();

router.post("/hello", authMiddleware, verifyRole("customer"));

export default router;
