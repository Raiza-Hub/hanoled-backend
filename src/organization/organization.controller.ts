import { NextFunction, Request, Response } from "express";
import OrganizationService from "./organization.service.js";
import { AppError } from "@/utils/appError.js";
import { IObject } from "@/admin/dto/dto.js";

export const getOrganizations = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log("get organizations session");

    const member = req.user;
    const organizationId = member.organizationId;

    const organization = await OrganizationService.getAllOrganizations(
      organizationId
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

    const activeOrganization = req.organization;

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

    res.status(200).json({ success: true, message: user });
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

    const member = req.user;
    const { slug } = req.params;
    const organizationId: string = member.organizationId;

    const organizationBySlug = await OrganizationService.getOrganizationBySlug(
      organizationId,
      slug
    );

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

    res.status(200).json({ success: true, message: user.role });
  } catch (err) {
    next(err);
  }
};

// export const getUserSchoolRoles = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const user = req.user;
//     const userId = user.id;

//     const memberUser = await MemberService.getMember(userId);

//     if (!memberUser) {
//       return next(new AppError("There was an issue getting the member", 500));
//     }

//     //check if member(teacher/admin/owner/role)
//     const memberRecord = await MemberService.getMemberRecord(
//       userId,
//       memberUser.organizationId
//     );

//     //check if parent
//     const parentRecord = await ParentService.getParentRecord(
//       userId,
//       memberUser.organizationId
//     );

//     const roles: string[] = [];

//     if (memberRecord) {
//       roles.push(memberRecord.role);
//     }
//     if (parentRecord) {
//       roles.push("parent");
//     }

//     res.status(200).json({ success: true, message: roles });
//   } catch (err) {
//     next(err);
//   }
// };
