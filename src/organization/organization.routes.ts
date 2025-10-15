import express, { Router } from "express";
import {
  createOrganization,
  getActiveOrganization,
  getMember,
  getOrganizationBySlug,
  getOrganizations,
  getSlug,
} from "@/organization/organization.controller.js";
import { getSession } from "@/middleware/getMemberSession.js";
import { verifyJwt } from "@/middleware/getUserSession.js";
import { refreshAccessToken } from "@/middleware/refreshToken.js";
import { isVerified } from "@/middleware/isVerified.js";

const router: Router = express.Router();

router.get("/userOrganizations", getSession, getOrganizations);

router.get(
  "/currentOrganization/:slug",
  refreshAccessToken,
  verifyJwt,
  isVerified,
  getSession,
  getActiveOrganization
);

router.get(
  "/member/:slug",
  refreshAccessToken,
  verifyJwt,
  isVerified,
  getSession,
  getMember
);

router.get(
  "/userOrganization/:slug",
  refreshAccessToken,
  verifyJwt,
  isVerified,
  getSession,
  getOrganizationBySlug
);

router.post(
  "/create",
  refreshAccessToken,
  verifyJwt,
  isVerified,
  createOrganization
);

router.get(
  "/getOrganization",
  refreshAccessToken,
  verifyJwt,
  isVerified,
  getSlug
);

export default router;
