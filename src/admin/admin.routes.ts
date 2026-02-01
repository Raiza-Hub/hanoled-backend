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
  removeMember,
  checkInvites,
  deleteAllPendingInvite,
  getMemberSpreadSheet,
  getAllOragnizationSpreadSheet,
  removeParent,
  archiveSpreadsheets,
  deleteSinglePendingInvite,
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

router.delete(
  "/member/remove/:slug",
  refreshAccessToken,
  verifyJwt,
  isVerified,
  getSession,
  isAdmin,
  removeMember
);

router.delete(
  "/parent/remove/:slug",
  refreshAccessToken,
  verifyJwt,
  isVerified,
  getSession,
  isAdmin,
  removeParent
);

router.get(
  "/check/invites/:slug",
  refreshAccessToken,
  verifyJwt,
  isVerified,
  getSession,
  isAdmin,
  checkInvites
);

router.delete(
  "/delete/pending/invites/:slug",
  refreshAccessToken,
  verifyJwt,
  isVerified,
  getSession,
  isAdmin,
  deleteAllPendingInvite
);

router.delete(
  "/delete/pending/invite/:slug",
  refreshAccessToken,
  verifyJwt,
  isVerified,
  getSession,
  isAdmin,
  deleteSinglePendingInvite
);

router.get(
  "/get/organization/spreadsheet/:slug",
  refreshAccessToken,
  verifyJwt,
  isVerified,
  getSession,
  isAdmin,
  getAllOragnizationSpreadSheet
);

router.get(
  "/get/organization/spreadsheet/member/:slug/:title",
  refreshAccessToken,
  verifyJwt,
  isVerified,
  getSession,
  isAdmin,
  getMemberSpreadSheet
);

router.get(
  "/organization/archive/spreadsheet/:slug/:className/:subjectName/:title",
  refreshAccessToken,
  verifyJwt,
  isVerified,
  getSession,
  isAdmin,
  archiveSpreadsheets
);


export default router;
