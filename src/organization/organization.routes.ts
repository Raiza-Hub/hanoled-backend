import express, { Router } from "express";
import {
  getActiveOrganization,
  getMember,
  getOrganizationBySlug,
  getOrganizations,
  getRoleInOrganization,
  getUserSchoolRoles,
} from "@/organization/organization.controller.js";
import { getSession } from "@/middleware/getUserSession.js";
import { getUserRole } from "@/middleware/getUserRole.js";

const router: Router = express.Router();

router.get("/userOrganizations", getSession, getOrganizations);

router.get("currentOrganization", getSession, getActiveOrganization);

router.get("/member", getSession, getMember);

router.get("/userOrganization/:slug", getSession, getUserRole, getOrganizationBySlug);

router.get("/organizationRole", getSession, getRoleInOrganization);

router.get("/schoolRoles", getSession, getUserSchoolRoles);

export default router;
