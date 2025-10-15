import MemberService from "@/member/member.service.js";
import { AppError } from "@/utils/appError.js";
import { NextFunction, Request, Response } from "express";

export const isAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const member = req.member;

    console.log(member);
    if (member.role !== "owner") {
      if (member.role !== "admin") {
        return next(
          new AppError("You dont have permission to access this endpoint", 401)
        );
      }
    }
    next();
  } catch (err) {
    return next(err);
  }
};
