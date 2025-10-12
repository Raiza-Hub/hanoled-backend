import express, { Router } from "express";
import {
  getActiveOrganization,
  getMember,
  getOrganizationBySlug,
  getOrganizations,
  getRoleInOrganization,
  // getUserSchoolRoles,
} from "@/organization/organization.controller.js";
import { getSession } from "@/middleware/getMemberSession.js";
import { activeOrganization } from "@/middleware/currentOrganization.js";

const router: Router = express.Router();

router.get("/userOrganizations", getSession, getOrganizations);

router.get(
  "/currentOrganization",
  getSession,
  activeOrganization,
  getActiveOrganization
);

router.get("/member", getSession, getMember);

router.get("/userOrganization/:slug", getSession, getOrganizationBySlug);

router.get("/organizationRole", getSession, getRoleInOrganization);

// router.get("/schoolRoles", getSession, getUserSchoolRoles);

export default router;
