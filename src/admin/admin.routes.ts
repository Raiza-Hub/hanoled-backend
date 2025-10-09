import { activeOrganization } from "@/middleware/currentOrganization.js";
import { getSession } from "@/middleware/getMemberSession.js";
import { isAdmin } from "@/middleware/isAdmin.js";
import express, { Router } from "express";
import {
  createNewClass,
  createNewSubject,
  getAllOrganizationClasses,
  getAllSubjects,
  createStudent,
  getUnassignedMembers,
  getAllMembers,
  getAllParents,
} from "./admin.controller.js";

const router: Router = express.Router();

router.get(
  "/subjects",
  getSession,
  isAdmin,
  activeOrganization,
  getAllSubjects
);

router.post(
  "/create/subject",
  getSession,
  isAdmin,
  activeOrganization,
  createNewSubject
);

router.post(
  "/create/class",
  getSession,
  isAdmin,
  activeOrganization,
  createNewClass
);

router.get(
  "/classes",
  getSession,
  isAdmin,
  activeOrganization,
  getAllOrganizationClasses
);

router.post(
  "/create/student",
  getSession,
  isAdmin,
  activeOrganization,
  createStudent
);

router.get(
  "/get/unassignedMember",
  getSession,
  isAdmin,
  activeOrganization,
  getUnassignedMembers
);

router.get(
  "/get/members",
  getSession,
  isAdmin,
  activeOrganization,
  getAllMembers
);
router.get(
  "/get/parents",
  getSession,
  isAdmin,
  activeOrganization,
  getAllParents
);

export default router;
