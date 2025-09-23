import { getActiveOrganization } from "@/middleware/currentOrganization.js";
import { getSession } from "@/middleware/getUserSession.js";
import { isAdmin } from "@/middleware/isAdmin.js";
import express, { Router } from "express";
import {
  createNewClass,
  createNewSubject,
  getAllOrganizationClasses,
  getAllSubjects,
} from "./admin.controller.js";

const router: Router = express.Router();

router.get(
  "/subjects",
  getSession,
  isAdmin,
  getActiveOrganization,
  getAllSubjects
);

router.post(
  "/create/subject",
  getSession,
  isAdmin,
  getActiveOrganization,
  createNewSubject
);

router.post(
  "/create/class",
  getSession,
  isAdmin,
  getActiveOrganization,
  createNewClass
);

router.get(
  "/classes",
  getSession,
  isAdmin,
  getActiveOrganization,
  getAllOrganizationClasses
);

export default router;
