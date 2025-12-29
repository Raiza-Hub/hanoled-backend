import AuthService from "@/auth/auth.service.js";
import { AppError } from "@/utils/appError.js";
import { NextFunction, Request, Response } from "express";

export const isVerified = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email } = req.user;

    //find user
    const user = await AuthService.findUser(email);
    if (!user) {
      return next(new AppError("Please Sign In", 401));
    }

    const isVerified = user.emailVerified;

    if (!isVerified) {
      return next(
        new AppError(
          "You cannot access this endpoint, please verify your account",
          400
        )
      );
    }
    next();
  } catch (err) {
    next(err);
  }
};
