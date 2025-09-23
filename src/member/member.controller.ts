import { NextFunction, Request, Response } from "express";
import AdminService from "@/admin/admin.service.js";
import { Subject } from "@/db/schema.js";

export const getAllSubjects = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const activeOrganization = req.organization;

    const organizationSubjects = await AdminService.getOrganizationSubjects(
      activeOrganization.id as string
    );

    const subjects = organizationSubjects.map((s: Subject) => s.subjectName);

    res.status(200).json({ sucess: true, message: subjects });
  } catch (err) {
    next(err);
  }
};

export const getAllOrganizationClasses = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const organization = req.organization;

    const organizationClasses = await AdminService.getOrganizationClasses(
      organization.id
    );

    if ((organizationClasses.length = 0)) {
      return [];
    }

    res.status(200).json({ success: true, message: organizationClasses });
  } catch (err) {
    next(err);
  }
};
