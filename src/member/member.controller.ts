import { NextFunction, Request, Response } from "express";
import AdminService from "@/admin/admin.service.js";
import { Subject } from "@/db/schema.js";
import { AppError } from "@/utils/appError.js";
import { IClass, IStudent, ISubjectSpreadsheet } from "@/admin/dto/dto.js";
import MemberService from "./member.service.js";
import cloudinary from "@/fileUpload/cloudinary.js";
import { success } from "zod";
import { sql } from "drizzle-orm";

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

    if (classExists.totalStudents === classExists.limit) {
      return next(
        new AppError(
          "The class limit has already been reached, kindly assign the student to another class",
          400
        )
      );
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

    const classData: Partial<IClass> = {
      totalStudents: classExists.totalStudents + 1,
    };

    const organizationStudentNo = organization.studentNo + 1;
    await AdminService.updateClass(organization.id, className, classData);
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

export const updateStudent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const organization = req.organization;
    // const member = req.member

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
    } = req.body;

    const studentExists = await AdminService.getStudent(
      firstName,
      lastName,
      middleName
    );

    if (!studentExists) {
      return next(new AppError("This student does not exist", 400));
    }

    const file = req.file?.path;
    let uploadedImage = studentExists.image;

    if (file && studentExists.image) {
      // Extract public_id from the existing Cloudinary URL
      const publicId = studentExists.image
        .split("/")
        .slice(-2)
        .join("/")
        .split(".")[0];
      await cloudinary.uploader.destroy(publicId);
    }

    if (file) {
      const upload = await cloudinary.uploader.upload(file as string);
      uploadedImage = upload.secure_url;
    }

    const classExists = await AdminService.getOrganizationClass(
      organization.id,
      className
    );
    if (!classExists) {
      return next(new AppError("This class does not exist", 400));
    }

    const studentData: Partial<IStudent> = {
      gender,
      dateOfBirth,
      guardianFullName,
      guardianPhone,
      guardianEmail,
      address,
      classLevel: classExists.id,
      image: uploadedImage as string,
    };

    const updatedStudent = await AdminService.updateStudent(
      studentExists.id,
      studentData
    );

    res.status(200).json({ success: true, message: updatedStudent });
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

export const createSubjectSpreadsheet = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const organization = req.organization;
    const member = req.member;

    const { name, body, className, subjectName } = req.body;

    const classExists = await AdminService.getOrganizationClass(
      organization.id,
      className
    );
    if (!classExists) {
      return next(new AppError("This class does not exist", 400));
    }
    const subjectExists = await AdminService.getOrganizationSubject(
      organization.id,
      subjectName
    );
    if (!subjectExists) {
      return next(new AppError("This subject does not exist", 400));
    }

    const spreadsheetExists = await MemberService.subjectSpreadsheetExists(
      organization.id,
      subjectExists.id,
      classExists.id
    );

    if (spreadsheetExists) {
      return next(new AppError("This spreadsheet already exists", 400));
    }

    const spreadsheetData: ISubjectSpreadsheet = {
      name,
      organizationId: organization.id,
      classId: classExists.id,
      subjectId: subjectExists.id,
      memberId: member.id,
      data: body,
    };

    const newClassSpreadsheet = await MemberService.createSubjectSpreadsheet(
      spreadsheetData
    );
  } catch (err) {
    next(err);
  }
};

export const mergeSubjectSpreadsheets = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const organization = req.organization;
    const member = req.member;

    const { name, selectedSubjects, selectedColumn, className, subjectName } =
      req.body;

    const classExists = await AdminService.getOrganizationClass(
      organization.id,
      className
    );
    if (!classExists) {
      return next(new AppError("This class does not exist", 400));
    }
    const subjectExists = await AdminService.getOrganizationSubject(
      organization.id,
      subjectName
    );
    if (!subjectExists) {
      return next(new AppError("This subject does not exist", 400));
    }

    if (!Array.isArray(selectedSubjects) || selectedSubjects.length === 0) {
      throw new AppError("No subjects selected", 400);
    }

    if (!selectedColumn) {
      throw new AppError("No column selected (e.g., 'CA 1')", 400);
    }

    const records = await MemberService.selectedSubjectResults(
      selectedColumn,
      selectedSubjects
    );

    // Step 2: Merge results by studentId
    const merged: Record<string, { [subject: string]: number; total: number }> =
      {};

    for (const record of records) {
      const { studentId, subjectName, value } = record;

      if (!merged[studentId]) merged[studentId] = { total: 0 };

      merged[studentId][subjectName] = value || 0;
      merged[studentId].total += value || 0;
    }

    // Step 3: Format response
    const formatted = Object.entries(merged).map(([studentId, scores]) => ({
      student_id: studentId,
      ...scores,
    }));

    res.status(200).json({
      success: true,
      data: formatted,
    });
  } catch (err) {
    next(err);
  }
};
