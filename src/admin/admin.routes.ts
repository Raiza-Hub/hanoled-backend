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
  inviteMember,
} from "./admin.controller.js";
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
  isAdmin,
  getAllSubjects
);

router.post(
  "/create/subject/:slug",
  refreshAccessToken,
  verifyJwt,
  isVerified,
  getSession,
  isAdmin,
  createNewSubject
);

router.post(
  "/create/class/:slug",
  refreshAccessToken,
  verifyJwt,
  isVerified,
  getSession,
  isAdmin,
  createNewClass
);

router.get(
  "/classes/:slug",
  refreshAccessToken,
  verifyJwt,
  isVerified,
  getSession,
  isAdmin,
  getAllOrganizationClasses
);

router.post(
  "/create/student/:slug",
  refreshAccessToken,
  verifyJwt,
  isVerified,
  getSession,
  isAdmin,
  createStudent
);

router.get(
  "/get/unassignedMember/:slug",
  refreshAccessToken,
  verifyJwt,
  isVerified,
  getSession,
  isAdmin,
  getUnassignedMembers
);

router.get(
  "/get/members/:slug",
  refreshAccessToken,
  verifyJwt,
  isVerified,
  getSession,
  isAdmin,
  getAllMembers
);
router.get(
  "/get/parents/:slug",
  refreshAccessToken,
  verifyJwt,
  isVerified,
  getSession,
  isAdmin,
  getAllParents
);

router.post(
  "/member/invite/:slug",
  refreshAccessToken,
  verifyJwt,
  isVerified,
  getSession,
  isAdmin,
  inviteMember
);

export default router;
