import AdminService from "@/admin/admin.service.js";
import AuthService from "@/auth/auth.service.js";
import UserService from "@/user/user.service.js";
import { AppError } from "@/utils/appError.js";
import { NextFunction, Request, Response } from "express";

export const isAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email } = req.query;
    if (!email) {
      return next(new AppError("Malformed Http Request", 401));
    }

    console.log(email);
    const userExists = await AuthService.findUser(email as string);

    if (!userExists) {
      return next(new AppError("You dont have an account, Please signuP", 401));
    }

    next();
  } catch (err) {
    return next(err);
  }
};
