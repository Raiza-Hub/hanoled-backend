import express, { Router } from "express";
import {
  getAllOrganizationClasses,
  getAllSubjects,
} from "./member.controller.js";
import { getSession } from "@/middleware/getUserSession.js";
import { getActiveOrganization } from "@/middleware/currentOrganization.js";

const router: Router = express.Router();

router.get("/subjects", getSession, getActiveOrganization, getAllSubjects);

router.get(
  "/classes",
  getSession,
  getActiveOrganization,
  getAllOrganizationClasses
);

export default router;
