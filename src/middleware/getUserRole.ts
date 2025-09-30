import MemberService from "@/member/member.service.js";
import ParentService from "@/parent/parent.service.js";
import { AppError } from "@/utils/appError.js";
import { NextFunction, Request, Response } from "express";

export const getUserRole = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;
    
    if (!user) {
      return next(new AppError("User not authenticated", 401));
    }

    const userId = user.id;

    const memberUser = await MemberService.getMember(userId);

    if (!memberUser) {
      return next(new AppError("There was an issue getting the member", 500));
    }

    // Check if member (teacher/admin/owner/role)
    const memberRecord = await MemberService.getMemberRecord(
      userId,
      memberUser.organizationId
    );

    // Check if parent
    const parentRecord = await ParentService.getParentRecord(
      userId,
      memberUser.organizationId
    );

    const roles: string[] = [];

    if (memberRecord) {
      roles.push(memberRecord.role);
    }
    if (parentRecord) {
      roles.push(parentRecord.role);
    }

    // Attach roles to request object for use in subsequent middleware/routes
    req.user = roles;

    // Continue to next middleware/route handler
    next();
  } catch (err) {
    next(err);
  }
};