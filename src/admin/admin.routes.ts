import { getSession } from "@/middleware/getMemberSession.js";
import { isAdmin } from "@/middleware/isAdmin.js";
import express, { Router } from "express";
import {
  createNewClass,
  createNewSubject,
  getAllOrganizationClasses,
  getUnassignedMembers,
  getAllMembers,
  inviteMember,
  inviteParent,
  deleteClass,
  deleteSubject,
  updateClass,
  getAllStudents,
} from "./admin.controller.js";
import { refreshAccessToken } from "@/middleware/refreshToken.js";
import { verifyJwt } from "@/middleware/getUserSession.js";
import { isVerified } from "@/middleware/isVerified.js";

const router: Router = express.Router();

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

router.post(
  "/member/invite/:slug",
  refreshAccessToken,
  verifyJwt,
  isVerified,
  getSession,
  isAdmin,
  inviteMember
);

router.post(
  "/parent/invite/:slug",
  refreshAccessToken,
  verifyJwt,
  isVerified,
  getSession,
  isAdmin,
  inviteParent
);

router.delete(
  "/class/delete/:slug",
  refreshAccessToken,
  verifyJwt,
  isVerified,
  getSession,
  isAdmin,
  deleteClass
);

router.delete(
  "/subject/delete/:slug",
  refreshAccessToken,
  verifyJwt,
  isVerified,
  getSession,
  isAdmin,
  deleteSubject
);

router.patch(
  "/class/update/:slug",
  refreshAccessToken,
  verifyJwt,
  isVerified,
  getSession,
  isAdmin,
  updateClass
);

router.get(
  "/get/students/:slug",
  refreshAccessToken,
  verifyJwt,
  isVerified,
  getSession,
  isAdmin,
  getAllStudents
);

export default router;
