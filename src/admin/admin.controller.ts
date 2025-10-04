import { AppError } from "@/utils/appError.js";
import { NextFunction, Request, Response } from "express";
import AdminService from "./admin.service.js";
import { member, Organization, student, Subject } from "@/db/schema.js";

export const getAllSubjects = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log("getting organization subjects");

    const activeOrganization = req.organization;

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
    const activeOrganization = req.organization;

    const { subjectName, memberId } = req.body;

    //check if subject already exists
    const subjectExists = await AdminService.getOrganizationSubject(
      activeOrganization.id,
      subjectName
    );

    if (subjectExists) {
      return next(new AppError("This subject already exists", 400));
    }

    const subjectData = {
      organizationId: activeOrganization.id,
      memberId,
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
    const { className, level, memberId, limit } = req.body;

    const organization = req.organization;

    const classExists = await AdminService.getOrganizationClass(
      organization.id,
      className
    );

    if (classExists) {
      return next(new AppError("This class already exists", 400));
    }

    const classData = {
      organizationId: organization.id,
      memberId,
      class: className,
      level,
      limit,
    };

    //identify that teacher has been assigned to a class
    await AdminService.updateMember(memberId, true);

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
    const organization = req.organization;

    const organizationClasses = await AdminService.getOrganizationClasses(
      organization.id
    );

    if (organizationClasses.length === 0) {
      return [];
    }

    res.status(200).json({ success: true, message: organizationClasses });
  } catch (err) {
    next(err);
  }
};

export const createStudent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const organization = req.organization;
    const organizationId = organization.id;
    const {
      firstName,
      lastName,
      middleName,
      gender,
      dateOfBirth,
      guardianFullName,
      guardianPhone,
      guardianEmail,
      address,
      classLevel,
      admissionDate,
    } = req.body;

    //check if student exists

    const studentExists = await AdminService.getStudent(
      firstName,
      lastName,
      middleName
    );

    if (studentExists) {
      return next(new AppError("This student already exists", 400));
    }
    const studentData = {
      organizationId,
      firstName,
      lastName,
      middleName,
      gender,
      dateOfBirth,
      guardianFullName,
      guardianPhone,
      guardianEmail,
      address,
      classLevel,
      admissionDate,
    };

    const newStudent = await AdminService.createStudent(studentData);

    res.status(200).json({ success: true, message: newStudent });
  } catch (err) {
    next(err);
  }
};
export const getAllMembers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const organization = req.organization;

    const getAllMembers = await AdminService.getOrganizationMembers(
      organization.id
    );

    res.status(200).json({ success: true, message: getAllMembers });
  } catch (err) {
    next(err);
  }
};

export const getAllParents = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const organization = req.organization;

    const getParents = await AdminService.getOrganizationParents(
      organization.id
    );
  } catch (err) {
    next(err);
  }
};

export const getUnassignedMembers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const organization = req.organization;

    const getAllMembers = await AdminService.getOrganizationMembers(
      organization.id
    );

    const unassignedMembers = getAllMembers.filter(
      (member) => member.isAssigned == false
    );

    res.status(200).json({ success: true, message: unassignedMembers });
  } catch (err) {
    next(err);
  }
};
