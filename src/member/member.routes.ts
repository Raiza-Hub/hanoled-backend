import express, { Router } from "express";
import {
  createStudent,
  getAllOrganizationClasses,
  getAllParents,
  getAllSubjects,
  getAssignedClass,
} from "./member.controller.js";
import { getSession } from "@/middleware/getMemberSession.js";
import { refreshAccessToken } from "@/middleware/refreshToken.js";
import { verifyJwt } from "@/middleware/getUserSession.js";
import { isVerified } from "@/middleware/isVerified.js";

const router: Router = express.Router();

router.get(
  "/subjects/:slug",
  refreshAccessToken,
  verifyJwt,
  isVerified,
  getSession,
  getAllSubjects
);

router.get(
  "/classes/:slug",
  refreshAccessToken,
  verifyJwt,
  isVerified,
  getSession,
  getAllOrganizationClasses
);

router.post(
  "/create/student/:slug",
  refreshAccessToken,
  verifyJwt,
  isVerified,
  getSession,
  createStudent
);

router.get(
  "/get/parents/:slug",
  refreshAccessToken,
  verifyJwt,
  isVerified,
  getSession,
  getAllParents
);

router.get(
  "/get/member/assignedClass/:slug",
  refreshAccessToken,
  verifyJwt,
  isVerified,
  getSession,
  getAssignedClass
);

export default router;
