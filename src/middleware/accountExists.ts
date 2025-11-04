import AuthService from "@/auth/auth.service.js";
import { AppError } from "@/utils/appError.js";
import { NextFunction, Request, Response } from "express";

export const accountExists = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email } = req.query;

    if (!email) {
      return next(new AppError("Malformed http request", 400));
    }

    const userExists = await AuthService.findUser(email as string);

    if (!userExists) {
      return next(
        new AppError("You do not have an account, please signUp", 401)
      );
    }
    next();
  } catch (err) {
    return next(err);
  }
};
