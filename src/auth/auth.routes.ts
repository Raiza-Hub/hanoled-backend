import express, { Router } from "express";
import { signIn, signUp /*verifyEmail*/ } from "./auth.controller";

const router: Router = express.Router();

router.post("/signIn", signIn);

router.post("/signUp", signUp);

// router.post("/verify-email", verifyEmail);

export default router;
