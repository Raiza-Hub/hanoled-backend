import { AppError } from "@/utils/appError.js";
import { NextFunction, Request, Response } from "express";

export const isAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;

    if (user.role !== "admin" || user.role !== "owner") {
      return next(
        new AppError("You dont have permission to access this endpoint", 401)
      );
    }

    req.user = user;
    next();
  } catch (err) {
    return next(err);
  }
};
