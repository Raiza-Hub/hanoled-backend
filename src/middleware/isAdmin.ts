import MemberService from "@/member/member.service.js";
import { AppError } from "@/utils/appError.js";
import { NextFunction, Request, Response } from "express";

export const isAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const memberUser = req.user

    // const memberUser = await MemberService.getMember(userId);

    // if (!memberUser) {
    //   return next(new AppError("There was an issue getting the member", 500));
    // }

    console.log(memberUser);
    if (memberUser.role !== "owner" || "admin") {
      return next(
        new AppError("You dont have permission to access this endpoint", 401)
      );
    }

    req.user = memberUser;
    next();
  } catch (err) {
    return next(err);
  }
};
