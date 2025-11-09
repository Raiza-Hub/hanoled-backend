import express, { Router } from "express";
import {
  createStudent,
  createSubjectSpreadsheet,
  getAllOrganizationClasses,
  getAllParents,
  getAllSubjects,
  getAssignedClass,
  mergeSubjectSpreadsheets,
  updateStudent,
} from "./member.controller.js";
import { getSession } from "@/middleware/getMemberSession.js";
import { refreshAccessToken } from "@/middleware/refreshToken.js";
import { verifyJwt } from "@/middleware/getUserSession.js";
import { isVerified } from "@/middleware/isVerified.js";
import { upload } from "@/fileUpload/multer.js";

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
  upload.single("file"),
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

router.patch(
  "/student/update/:slug",
  refreshAccessToken,
  verifyJwt,
  isVerified,
  getSession,
  updateStudent
);

router.post(
  "/spreadsheet/subject/create/:slug",
  refreshAccessToken,
  verifyJwt,
  isVerified,
  getSession,
  createSubjectSpreadsheet
);

router.post(
  "/spreadsheet/merge/:slug",
  refreshAccessToken,
  verifyJwt,
  isVerified,
  getSession,
  mergeSubjectSpreadsheets
);

export default router;
