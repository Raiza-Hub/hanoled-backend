import { NextFunction, Request, Response } from "express";
import AdminService from "@/admin/admin.service.js";
import { Subject } from "@/db/schema.js";
import { AppError } from "@/utils/appError.js";
import { IStudent } from "@/admin/dto/dto.js";
import MemberService from "./member.service.js";
import cloudinary from "@/fileUpload/cloudinary.js";

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
      className,
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

    let uploadedFile;
    const file = req.file?.path;
    if (file) {
      const upload = await cloudinary.uploader.upload(file as string);
      uploadedFile = upload.secure_url;
    } else {
      uploadedFile = "null";
    }

    const classExists = await AdminService.getOrganizationClass(
      organizationId,
      className
    );

    if (!classExists) {
      return next(new AppError("This class does not exist", 400));
    }

    const classLevel = classExists.id;
    const studentData: IStudent = {
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
      image: uploadedFile,
    };

    const organizationStudentNo = organization.studentNo + 1;
    await AdminService.updateOrganizationStudent(
      organization.slug,
      organizationStudentNo
    );

    const newStudent = await AdminService.createStudent(studentData);

    res.status(200).json({ success: true, message: newStudent });
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

    res.status(200).json({ sucess: true, message: getParents });
  } catch (err) {
    next(err);
  }
};

export const getAssignedClass = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const member = req.member;

    const assignedClass = await MemberService.getAssignedClass(member.id);

    res.status(200).json({ success: true, message: assignedClass });
  } catch (err) {
    next(err);
  }
};
