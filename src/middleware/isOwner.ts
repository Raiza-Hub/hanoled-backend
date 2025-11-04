import { AppError } from "@/utils/appError.js";
import { NextFunction, Request, Response } from "express";

export const isOwner = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const member = req.member;

    if (member.role !== "owner") {
      return next(
        new AppError("You dont have permission to access this endpoint", 401)
      );
    }
    next();
  } catch (err) {
    return next(err);
  }
};
