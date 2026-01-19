import { NextFunction, Request, Response } from "express";
import AdminService from "@/admin/admin.service.js";
import { AppError } from "@/utils/appError.js";
import {
  IClass,
  IColumn,
  IColumnValues,
  ISpreadsheetDetails,
  IStudent,
} from "@/admin/dto/dto.js";
import MemberService from "./member.service.js";
import cloudinary from "@/fileUpload/cloudinary.js";
import { getOrgClasandSubId } from "@/utils/getSubandClassId.js";

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

    // const subjects = organizationSubjects.map((s: Subject) => s.subjectName);

    res.status(200).json({ sucess: true, message: organizationSubjects });
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

export const createSpreadsheet = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const organization = req.organization;
    const member = req.member;
    const { title, rows, className, subjectName } = req.body;
    const status = "pending";

    const { subjectId, classId } = await getOrgClasandSubId(
      organization.id,
      subjectName,
      className
    );

    const spreadsheetExists = await MemberService.getRawSpreadSheetDetails(
      member.id,
      subjectId,
      classId,
      status as "active" | "pending" | "inactive"
    );

    if (spreadsheetExists) {
      return next(new AppError("This spreadsheet already exists", 400));
    }

    const columns: IColumn[] =
      rows.length > 0
        ? Object.keys(rows[0]).map((name, index) => ({
            name,
            index,
          }))
        : [];

    const context: ISpreadsheetDetails = {
      organizationId: organization.id,
      classId,
      subjectId,
      memberId: member.id,
      title,
    };
    const spreadsheetDetails = await MemberService.createSpreadsheetDetails(
      context,
      columns
    );

    const columnData: Record<number, any> = {};

    columns.forEach((col) => {
      columnData[col.index] = [];
    });

    rows.forEach((row) => {
      columns.forEach((col) => {
        columnData[col.index].push(row[col.name]);
      });
    });

    const valuesToInsert = columns.map((col) => {
      const colMeta = spreadsheetDetails[0]; // Assuming single spreadsheetDetails record
      return {
        spreadsheetDetailsId: colMeta.id,
        // We wrap the data in a JSON object headed by the index
        values: {
          index: col.index,
          data: columnData[col.index],
        } as IColumnValues,
      };
    });

    const insertedValues = await MemberService.createSpreadSheetData(
      valuesToInsert
    );

    res.status(200).json({
      success: true,
      details: spreadsheetDetails,
      data: insertedValues,
    });
  } catch (err) {
    next(err);
  }
};

export const getSpreadSheet = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const organizationId = req.organization.id;
    const memberId = req.member.id;
    const { subjectName, className } = req.params;
    const status = "pending";

    const { subjectId, classId } = await getOrgClasandSubId(
      organizationId,
      subjectName,
      className
    );

    const spreadsheet = await MemberService.getSpreadsheetForHandsontable(
      memberId as string,
      subjectId,
      classId,
      status as "active" | "pending" | "inactive"
    );

    res.status(200).json({ success: true, data: spreadsheet });
  } catch (err) {
    next(err);
  }
};

export const updateFullSpreadsheet = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const organizationId = req.organization.id;
    const memberId = req.member.id;
    const { subjectName, className } = req.params;
    const { title, rows } = req.body;
    const status = "pending";

    const { subjectId, classId } = await getOrgClasandSubId(
      organizationId,
      subjectName,
      className
    );
    const spreadsheetExists = await MemberService.getRawSpreadSheetDetails(
      memberId,
      subjectId,
      classId,
      status as "active" | "pending" | "inactive"
    );

    if (!spreadsheetExists) {
      return next(new AppError("This spreadsheet does not exist", 400));
    }

    const updatedSpreadsheet = await MemberService.updateFullSpreadsheet(
      memberId,
      subjectId,
      classId,
      title,
      rows
    );

    res.status(200).json({ success: true, data: updatedSpreadsheet });
  } catch (err) {
    next(err);
  }
};

export const mergeSpreadSheets = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const organizationId = req.organization.id;
    const memberId = req.member.id;
    const { subjectName, className, title, selections } = req.body;
    const status = "pending";

    const { subjectId, classId } = await getOrgClasandSubId(
      organizationId,
      subjectName,
      className
    );

    const spreadsheetExists = await MemberService.getRawSpreadSheetDetails(
      memberId,
      subjectId,
      classId,
      status as "active" | "pending" | "inactive"
    );

    if (!spreadsheetExists) {
      return next(new AppError("This spreadsheet does not exist", 400));
    }

    const context: ISpreadsheetDetails = {
      organizationId,
      subjectId,
      classId,
      memberId,
      title,
    };

    const mergeSpreadSheets = await MemberService.combineColumnsToNewSheet(
      context,
      title,
      selections
    );

    res.status(200).json({ success: true, details: mergeSpreadSheets });
  } catch (err) {
    next(err);
  }
};

export const updateByMerging = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const organizationId = req.organization.id;
    const memberId = req.member.id;
    const { subjectName, className } = req.params;
    const { selections } = req.body;
    const status = "pending";

    const { subjectId, classId } = await getOrgClasandSubId(
      organizationId,
      subjectName,
      className
    );

    const targetDetails = await MemberService.getRawSpreadSheetDetails(
      memberId,
      subjectId,
      classId,
      status as "active" | "pending" | "inactive"
    );

    if (!targetDetails) {
      return next(new AppError("This spreadsheet does not exist", 400));
    }

    const detailsId = targetDetails.id;

    const updatedByMerge = await MemberService.mergeColumnsIntoSpreadsheet(
      detailsId,
      selections
    );

    res.status(200).json({ success: true, details: updatedByMerge });
  } catch (err) {
    next(err);
  }
};

export const getAllMemberSpreadsheets = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const memberId = req.member.id;
    const status = "pending";

    const spreadsheets = await MemberService.getMemberSpreadsheets(
      memberId,
      status as "active" | "pending" | "inactive"
    );

    return res.status(200).json({
      success: true,
      count: spreadsheets.length,
      data: spreadsheets,
    });
  } catch (err) {
    next(err);
  }
};

export const getStudentById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { studentId } = req.params;

    const student = await MemberService.getStudentById(studentId);

    if (!student) {
      return next(new AppError("This student does not exist", 400));
    }

    res.status(200).json({ success: true, message: student });
  } catch (err) {
    next(err);
  }
};

export const uploadSpreadsheet = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const organization = req.organization;
    const memberId = req.member.id;
    const { subjectName, className } = req.params;
    const status = "pending";

    const { subjectId, classId } = await getOrgClasandSubId(
      organization.id,
      subjectName,
      className
    );

    const newStatus = "active" as "active" | "pending" | "inactive";
    const updateStatusData = {
      status: newStatus,
    };

    const uploadSpredsheet = await MemberService.updateSpreadsheetStatus(
      memberId,
      subjectId,
      classId,
      updateStatusData,
      status as "active" | "pending" | "inactive"
    );

    res.status(200).json({ success: true, message: uploadSpredsheet });
  } catch (err) {
    next(err);
  }
};

export const getRawSpreadsheetWithDetails = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const organization = req.organization;
    const memberId = req.member.id;
    const { subjectName, className } = req.params;
    const status = "pending";

    const { subjectId, classId } = await getOrgClasandSubId(
      organization.id,
      subjectName,
      className
    );

    const targetDetails = await MemberService.getRawSpreadSheetDetails(
      memberId,
      subjectId,
      classId,
      status as "active" | "pending" | "inactive"
    );

    res.status(200).json({ success: true, message: targetDetails });
  } catch (err) {
    next(err);
  }
};

export const getRawSpreadSheetById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const organization = req.organization;
    //give me the id's in an array similar to the way u sent selections
    const { targetDetailsIds } = req.body;

    const spreadsheets = targetDetailsIds.map(async (id: string) => {
      return await MemberService.getSpreadsheetById(id);
    });

    res.status(200).json({ success: true, message: spreadsheets });
  } catch (err) {
    next(err);
  }
};
