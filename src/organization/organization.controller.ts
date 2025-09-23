import MemberService from "@/member/member.service.js";
import { NextFunction, Request, Response } from "express";
import OrganizationService from "./organization.service.js";
import { AppError } from "@/utils/appError.js";
import ParentService from "@/parent/parent.service.js";

export const getOrganizations = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log("get organizations session");

    const user = req.user;

    // const { user } = await getUserSession(req);

    const memberships = await MemberService.getAllMembers(user.id);

    if (memberships.length == 0) {
      return [];
    }

    const organization = await OrganizationService.getAllMemberOrganizations(
      memberships
    );

    res.status(200).json({ success: true, message: organization });
  } catch (err) {
    next(err);
  }
};

export const getActiveOrganization = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log("get active organization session");

    const user = req.user;

    const userId = user.id;

    const memberUser = await MemberService.getMember(userId);

    if (!memberUser) {
      return next(new AppError("There was an issue getting the member", 500));
    }

    const activeOrganization = await OrganizationService.getActiveOrganization(
      memberUser.organizationId
    );

    res.status(200).json({ success: true, message: activeOrganization });
  } catch (err) {
    next(err);
  }
};

export const getMember = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log("get member session");

    const user = req.user;

    const uniqueMember = await MemberService.getMember(user.id);

    if (!uniqueMember) {
      return next(new AppError("There was an issue getting the member", 500));
    }

    res.status(200).json({ success: true, message: uniqueMember });
  } catch (err) {
    next(err);
  }
};

export const getOrganizationBySlug = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log("get slug organization session");

    const { slug } = req.params;

    const organizationBySlug = await OrganizationService.getOrganizationBySlug(
      slug
    );

    if (!organizationBySlug) {
      return next(
        new AppError(`There is no organization with the slug ${slug}`, 400)
      );
    }

    res.status(200).json({ success: true, message: organizationBySlug });
  } catch (err) {
    next(err);
  }
};

export const getRoleInOrganization = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;
    const memberUser = await MemberService.getMember(user.id);

    if (!memberUser) {
      return next(new AppError("There was an issue getting the member", 500));
    }

    res.status(200).json({ success: true, message: memberUser.role });
  } catch (err) {
    next(err);
  }
};

export const getUserSchoolRoles = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;
    const userId = user.id;

    const memberUser = await MemberService.getMember(userId);

    if (!memberUser) {
      return next(new AppError("There was an issue getting the member", 500));
    }

    //check if member(teacher/admin/owner/role)
    const memberRecord = await MemberService.getMemberRecord(
      userId,
      memberUser.organizationId
    );

    //check if parent
    const parentRecord = await ParentService.getParentRecord(
      userId,
      memberUser.organizationId
    );

    const roles: string[] = [];

    if (memberRecord) {
      roles.push(memberRecord.role);
    }
    if (parentRecord) {
      roles.push("parent");
    }

    res.status(200).json({ success: true, message: roles });
  } catch (err) {
    next(err);
  }
};
