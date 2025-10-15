import { NextFunction, Request, Response } from "express";
import OrganizationService from "./organization.service.js";
import { AppError } from "@/utils/appError.js";
import { IMember, IOrganization } from "@/admin/dto/dto.js";
import MemberService from "@/member/member.service.js";
import { member, Organization } from "@/db/schema.js";

export const getOrganizations = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log("get organizations session");

    const member = req.member;
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

    const member = req.member;

    res.status(200).json({ success: true, message: member });
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

    const member = req.member;
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

export const createOrganization = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, slug, logo, metadata } = req.body;
    const user = req.user;

    //check if organization exists
    const organizationExists = await OrganizationService.getOrganization(
      name,
      slug
    );

    if (organizationExists) {
      return next(new AppError("This organization already exists", 400));
    }

    const orgData: IOrganization = {
      name,
      slug,
      logo,
      metadata,
    };
    const [newOrganization] = await OrganizationService.createOrganization(
      orgData
    );

    //create correspondng member
    const memberData: IMember = {
      organizationId: newOrganization.id,
      userId: user.id,
      role: "owner",
      isAssigned: true,
    };
    const member = await MemberService.createMember(memberData);

    res.status(200).json({ sucess: true, message: newOrganization });
  } catch (err) {
    next(err);
  }
};

export const getSlug = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const organizations = await OrganizationService.findAllOrganization();
    const organizationSlug = organizations.map((m: Organization) => m.slug);

    res.status(200).json({ message: organizationSlug });
  } catch (err) {
    next(err);
  }
};
