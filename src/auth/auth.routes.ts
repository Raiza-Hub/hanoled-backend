import express, { Router } from "express";
import {
  deleteProfile,
  forgotPassword,
  getNewOtp,
  logout,
  resetPassword,
  updateUser,
  userLogin,
  userProfile,
  userSignUp,
  verifyUser,
} from "./auth.controller.js";

import { verifyJwt } from "@/middleware/getUserSession.js";
import { refreshAccessToken } from "@/middleware/refreshToken.js";
import { isVerified } from "@/middleware/isVerified.js";
import { upload } from "@/fileUpload/multer.js";

const router: Router = express.Router();

router.post("/signUp", upload.single("file"), userSignUp);

router.post("/signIn", userLogin);

router.put("/verifyUser", refreshAccessToken, verifyJwt, verifyUser);

router.get("/getNewOtp", refreshAccessToken, verifyJwt, getNewOtp);

router.get(
  "/userProfile",
  refreshAccessToken,
  verifyJwt,
  isVerified,
  userProfile
);

router.put(
  "/userDelete",
  refreshAccessToken,
  verifyJwt,
  isVerified,
  deleteProfile
);

router.post(
  "/forgotPassword",
  refreshAccessToken,
  verifyJwt,
  isVerified,
  forgotPassword
);

router.put(
  "/resetPassword",
  refreshAccessToken,
  verifyJwt,
  isVerified,
  resetPassword
);

router.patch(
  "/updateUser",
  refreshAccessToken,
  verifyJwt,
  isVerified,
  upload.single("file"),
  updateUser
);

router.get("/logout", logout);

export default router;
