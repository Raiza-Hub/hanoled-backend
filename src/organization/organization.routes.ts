import express, { Router } from "express";
import {
  createOrganization,
  deleteOrganization,
  getActiveOrganization,
  getMember,
  getOrganizationBySlug,
  getSlug,
  getUserOrganizations,
  updateOrganization,
} from "@/organization/organization.controller.js";
import { getSession } from "@/middleware/getMemberSession.js";
import { verifyJwt } from "@/middleware/getUserSession.js";
import { refreshAccessToken } from "@/middleware/refreshToken.js";
import { isVerified } from "@/middleware/isVerified.js";
import { isOwner } from "@/middleware/isOwner.js";

const router: Router = express.Router();

// router.get("/userOrganizations", getSession, getOrganizations);

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
  "/organization/:slug",
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

router.get(
  "/userOrganizations",
  refreshAccessToken,
  verifyJwt,
  isVerified,
  getUserOrganizations
);

router.patch(
  "/updateOrganization/:slug",
  refreshAccessToken,
  verifyJwt,
  isVerified,
  getSession,
  isOwner,
  updateOrganization
);

router.delete(
  "deleteOrganization/:slug",
  refreshAccessToken,
  verifyJwt,
  isVerified,
  getSession,
  isOwner,
  deleteOrganization
);

export default router;
