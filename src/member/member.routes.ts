import express, { Router } from "express";
import {
  createSpreadsheet,
  createStudent,
  getAllMemberSpreadsheets,
  // createSubjectSpreadsheet,
  getAllOrganizationClasses,
  getAllParents,
  getAllSubjects,
  getAssignedClass,
  getSpreadSheet,
  getStudentById,
  mergeSpreadSheets,
  updateByMerging,
  updateFullSpreadsheet,
  // mergeSubjectSpreadsheets,
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

router.get(
  "/student/:slug",
  refreshAccessToken,
  verifyJwt,
  isVerified,
  getSession,
  getStudentById
);

router.post(
  "/spreadsheet/subject/create/:slug",
  refreshAccessToken,
  verifyJwt,
  isVerified,
  getSession,
  createSpreadsheet
);

router.get(
  "/spreadsheet/subject/get/:slug/:className/:subjectName",
  refreshAccessToken,
  verifyJwt,
  isVerified,
  getSession,
  getSpreadSheet
);

router.patch(
  "/spreadsheet/subject/update/:slug/:className/:subjectName",
  refreshAccessToken,
  verifyJwt,
  isVerified,
  getSession,
  updateFullSpreadsheet
);

router.post(
  "/spreadsheet/subject/merge/:slug",
  refreshAccessToken,
  verifyJwt,
  isVerified,
  getSession,
  mergeSpreadSheets
);

router.patch(
  "/spreadsheet/subject/update/merge/:slug/:className/:subjectName",
  refreshAccessToken,
  verifyJwt,
  isVerified,
  getSession,
  updateByMerging
);

router.get(
  "/spreadsheet/member/:slug",
  refreshAccessToken,
  verifyJwt,
  isVerified,
  getSession,
  getAllMemberSpreadsheets
);

// router.post(
//   "/spreadsheet/subject/create/:slug",
//   refreshAccessToken,
//   verifyJwt,
//   isVerified,
//   getSession,
//   createSubjectSpreadsheet
// );

// router.post(
//   "/spreadsheet/merge/:slug",
//   refreshAccessToken,
//   verifyJwt,
//   isVerified,
//   getSession,
//   mergeSubjectSpreadsheets
// );

export default router;
