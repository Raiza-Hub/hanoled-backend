import express, { Router } from "express";
import {
  getAllOrganizationClasses,
  getAllSubjects,
} from "./member.controller.js";
import { getSession } from "@/middleware/getUserSession.js";
import { activeOrganization } from "@/middleware/currentOrganization.js";

const router: Router = express.Router();

router.get("/subjects", getSession, activeOrganization, getAllSubjects);

router.get(
  "/classes",
  getSession,
  activeOrganization,
  getAllOrganizationClasses
);

export default router;
