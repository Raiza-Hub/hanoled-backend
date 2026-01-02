import { IMember, IOrganization } from "@/admin/dto/dto.js";
import { Organization, user } from "@/db/schema.js";
import MemberService from "@/member/member.service.js";
import { AppError } from "@/utils/appError.js";
import { NextFunction, Request, Response } from "express";
import OrganizationService from "./organization.service.js";
import cloudinary from "@/fileUpload/cloudinary.js";
import ParentService from "@/parent/parent.service.js";
import { string, success } from "zod";

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
    const role = req.role;
    const organizationId: string = member.organizationId;

    const organizationBySlug = await OrganizationService.getOrganizationBySlug(
      organizationId,
      slug
    );

    res.status(200).json({ success: true, message: organizationBySlug, role });
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
    const {
      name,
      slug,
      phone,
      email,
      country,
      address,
      city,
      state,
      zipCode,
      category,
      schoolType,
      website,
      socialLinks,
    } = req.body;
    const user = req.user;

    //check if slug in use
    const slugUsed = await OrganizationService.findOrgBySlug(slug);

    if (slugUsed) {
      return next(new AppError("This Slug is already in use", 400));
    }

    //check if organization exists
    const organizationExists = await OrganizationService.getOrganization(
      name,
      slug
    );

    if (organizationExists) {
      return next(new AppError("This organization already exists", 400));
    }
    let uploadedUrl;
    const file = req.file?.path;
    if (file) {
      const upload = await cloudinary.uploader.upload(file as string);
      uploadedUrl = upload.secure_url;
    } else {
      uploadedUrl = "null";
    }

    const orgData: IOrganization = {
      name,
      slug,
      logo: uploadedUrl,
      phone,
      email,
      country,
      address,
      city,
      state,
      zipCode,
      category,
      schoolType,
      website,
      socialLinks,
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
    await MemberService.createMember(memberData);

    res.status(200).json({ sucess: true, message: newOrganization });
  } catch (err) {
    next(err);
  }
};

export const getUserOrganizations = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user.id;
    const organizations = await OrganizationService.findAllOrganization();
    const userOrganizations: Organization[] = [];

    await Promise.all(
      organizations.map(async (userOrgs) => {
        const organizationId = userOrgs.id;
        const member = await MemberService.getSpecificMember(
          userId,
          organizationId
        );
        const parent = await ParentService.getParentRecord(
          userId,
          organizationId
        );
        if (member || parent) {
          userOrganizations.push(userOrgs);
        }
      })
    );
    res.status(200).json({ result: success, message: userOrganizations });
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

export const updateOrganization = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      name,
      email,
      slug,
      country,
      address,
      city,
      state,
      zipCode,
      website,
      socialLinks,
      phone,
    } = req.body;
    const organization = req.organization;
    let uploadedUrl = organization.logo;

    const file = req.file?.path;
    if (file && organization.logo) {
      // Extract public_id from the existing Cloudinary URL
      const publicId = organization.logo
        .split("/")
        .slice(-2)
        .join("/")
        .split(".")[0];
      await cloudinary.uploader.destroy(publicId);
    }

    if (file) {
      const upload = await cloudinary.uploader.upload(file as string);
      uploadedUrl = upload.secure_url;
    }

    if (slug) {
      const usedSlug = await OrganizationService.getOrganizationBySlug(
        organization.id,
        slug
      );
      if (usedSlug) {
        if (usedSlug.id !== organization.id) {
          return next(
            new AppError(
              "This Slug is already in use by another organization",
              400
            )
          );
        }
      }
    }

    const organizationData = {
      name,
      email,
      slug,
      logo: uploadedUrl,
      country,
      address,
      city,
      state,
      zipCode,
      website,
      socialLinks,
      phone,
    };

    const updateOrganization = await OrganizationService.updateOrganization(
      organization.id,
      organizationData
    );
    res.status(200).json({ success: true, message: updateOrganization });
  } catch (err) {
    next(err);
  }
};

export const deleteOrganization = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const organization = req.organization;

    await OrganizationService.deleteOrganization(organization.id);

    res.status(200).json({
      success: true,
      message: "Your Organization has been deleted sucessfully",
    });
  } catch (err) {
    next(err);
  }
};
