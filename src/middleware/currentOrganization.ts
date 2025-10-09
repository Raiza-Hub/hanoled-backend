import MemberService from "@/member/member.service.js";
import OrganizationService from "@/organization/organization.service.js";
import { AppError } from "@/utils/appError.js";
import { NextFunction, Request, Response } from "express";

export const activeOrganization = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log("get active organization session");

    const memberUser = req.user;

    const activeOrganization = await OrganizationService.getActiveOrganization(
      memberUser.organizationId
    );

    if (!activeOrganization) {
      return next(
        new AppError("There was an issue getting the organization", 500)
      );
    }

    req.organization = activeOrganization;

    next();
  } catch (err) {
    next(err);
  }
};
