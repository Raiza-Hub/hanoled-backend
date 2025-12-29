import { verifyJwt } from "@/middleware/getUserSession.js";
import { isVerified } from "@/middleware/isVerified.js";
import { refreshAccessToken } from "@/middleware/refreshToken.js";
import express, { Router } from "express";
import { inviteeDecision } from "./user.controller.js";
import { accountExists } from "@/middleware/accountExists.js";

const router: Router = express.Router();

router.post(
  "/invitee/:organizationId",
  accountExists,
  refreshAccessToken,
  verifyJwt,
  isVerified,
  inviteeDecision
);

export default router;
