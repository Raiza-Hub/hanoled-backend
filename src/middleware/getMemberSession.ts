import MemberService from "@/member/member.service.js";
import OrganizationService from "@/organization/organization.service.js";
import ParentService from "@/parent/parent.service.js";
import { AppError } from "@/utils/appError.js";
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export const getSession = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log("Received cookies:", req.cookies);

    const { slug } = req.params;
    const session = req.user;
    let roles: string[] = [];

    const organization = await OrganizationService.getSpecificOrganization(
      slug
    );

    if (!organization) {
      return next(new AppError("This organization does not exist", 400));
    }

    const memberUser = await MemberService.getSpecificMember(
      session.id,
      organization.id
    );

    const parentUser = await ParentService.getParentRecord(
      session.id,
      organization.id
    );

    console.log(memberUser, parentUser);
    if (!memberUser && !parentUser) {
      return next(new AppError("There was an issue getting the member", 500));
    }

    if (memberUser && parentUser) {
      req.member = memberUser;
      roles.push(parentUser.role, memberUser.role);
      console.log(roles);
      req.role = roles;
      req.organization = organization;
      next();
    } else if (parentUser) {
      req.member = parentUser;
      roles.push(parentUser.role);
      req.role = roles;
      req.organization = organization;
      next();
    } else if (memberUser) {
      req.member = memberUser;
      roles.push(memberUser.role);
      req.role = roles;
      req.organization = organization;
      next();
    }

    // session.user contains user details from Better Auth
  } catch (err) {
    console.error("Session error:", err);
    return next(err);
  }
};
