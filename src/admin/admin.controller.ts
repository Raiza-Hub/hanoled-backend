import { AppError } from "@/utils/appError.js";
import { NextFunction, Request, Response } from "express";
import AdminService from "./admin.service.js";
import { Organization, Subject } from "@/db/schema.js";


export const getAllSubjects = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log("getting organization subjects");

    const activeOrganization: Organization = req.organization;

    const organizationSubjects = await AdminService.getOrganizationSubjects(
      activeOrganization.id as string
    );

    if (organizationSubjects.length == 0) {
      return [];
    }

    const subjects = organizationSubjects.map((s: Subject) => s.subjectName);

    res.status(200).json({ sucess: true, message: subjects });
  } catch (err) {
    next(err);
  }
};

export const createNewSubject = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const activeOrganization: Organization = req.organization;

    const { subjectName } = req.body;

    //check if subject already exists
    const subjectExists = await AdminService.getOrganizationSubject(
      activeOrganization.id,
      subjectName,
    );

    if (subjectExists) {
      return next(new AppError("This subject already exists", 400));
    }

    const subjectData = {
      organizationId: activeOrganization.id,
      subjectName,
    };

    const newSubject = await AdminService.createSubject(subjectData);

    res.status(200).json({ success: true, message: newSubject });
  } catch (err) {
    next(err);
  }
};

export const createNewClass = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { className, level } = req.body;

    const  activeOrganization: Organization = req.organization;

    const classExists = await AdminService.getOrganizationClass(
       activeOrganization.id,
      className
    );

    if (classExists) {
      return next(new AppError("This class already exists", 400));
    }

    const classData = {
      organizationId:  activeOrganization.id,
      class: className,
      level,
    };

    const newClass = await AdminService.createClass(classData);

    res.status(200).json({ success: true, message: newClass });
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
    const activeOrganization: Organization = req.organization;

    const organizationClasses = await AdminService.getOrganizationClasses(
       activeOrganization.id
    );

    if ((organizationClasses.length === 0)) {
      return [];
    }

    res.status(200).json({ success: true, message: organizationClasses });
  } catch (err) {
    next(err);
  }
};
