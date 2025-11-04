import { AppError } from "@/utils/appError.js";
import { NextFunction, Request, Response } from "express";
import AdminService from "./admin.service.js";
import { IInvite } from "./dto/dto.js";
import {
  EmailVerificationOptions,
  sendEmailVerification,
} from "@/utils/mailer.js";
import MemberService from "@/member/member.service.js";
import { Student } from "@/db/schema.js";

export const createNewSubject = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const activeOrganization = req.organization;
    const member = req.member;
    const memberId = member.id;

    const { subjectName } = req.body;

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

    const memberExists = await MemberService.checkMember(
      memberId,
      organization.id
    );

    if (!memberExists) {
      return next(new AppError("This member does not exist", 400));
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

    res.status(200).json({ success: true, message: organizationClasses });
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

export const inviteMember = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;
    const member = req.member;
    const organization = req.organization;
    const { rawEmail, role } = req.body;
    if (!role) {
      return next(new AppError("Please select role", 400));
    }
    console.log(rawEmail);
    const email = rawEmail
      .map((e: { value: string; email: string }) => e.value)
      .filter(Boolean);

    console.log(email);

    const inviteExpiry: Date = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24hrs from now

    const data = await Promise.all(
      email.map(async (e: string) => {
        if (user.email == e) {
          throw new AppError("You cannot invite yourself", 400);
        }
        const invited = await AdminService.findInvite(e, role);
        if (invited) {
          if (invited.role == "admin") {
            throw new AppError(
              `member ${e} has already been invited, status:: ${invited.status}`,
              400
            );
          }
          if (invited.role == "member") {
            throw new AppError(
              `member ${e} has already been invited, status:: ${invited.status}`,
              400
            );
          }
        }

        const inviteData: IInvite = {
          organizationId: organization.id,
          email: e,
          role,
          status: "pending",
          expiresAt: inviteExpiry.toISOString(),
          inviterId: member.id,
        };

        const invite = await AdminService.createInvite(inviteData);

        const message: EmailVerificationOptions = {
          email: e,
          subject: `Invite from ${organization.name}`,
          message: `Invite to be a part of ${organization.name} as a ${role},
          Click the link http://localhost:1948/api/user/invitee/${organization.id}?role=${role}&email=${e} to be a part of them`,
        };
        console.log(message);
        await sendEmailVerification(message);
      })
    );

    res.status(200).json({
      sucess: true,
      message: `The invite has been sent to ${email}`,
    });
  } catch (err) {
    next(err);
  }
};

export const inviteParent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;
    const member = req.member;
    const organization = req.organization;
    const { rawEmail, studentIds } = req.body;
    const role = "parent";
    console.log(rawEmail);
    const email = rawEmail
      .map((e: { value: string; email: string }) => e.value)
      .filter(Boolean);
    // const studentIds = rawStudentIds
    //   .map((e: { value: string; id: string }) => e.value)
    //   .filter(Boolean);

    console.log(email);
    console.log(studentIds);

    const confirmStudents = await Promise.all(
      studentIds.map(async (sId: string) => {
        const studentExists = await AdminService.getSpecificStudent(
          organization.id,
          sId
        );
        if (!studentExists) {
          throw new AppError("This student does not exist", 400);
        }
        return sId;
      })
    );

    console.log(confirmStudents);
    const inviteExpiry: Date = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24hrs from now

    const data = await Promise.all(
      email.map(async (e: string) => {
        if (user.email == e) {
          throw new AppError("You cannot invite yourself", 400);
        }
        const invited = await AdminService.findInvite(e, role);
        if (invited) {
          throw new AppError(
            `Parent ${e} has already been invited, status:: ${invited.status}`,
            400
          );
        }
        const inviteData: IInvite = {
          organizationId: organization.id,
          email: e,
          role: role as "member" | "admin" | "parent",
          status: "pending",
          expiresAt: inviteExpiry.toISOString(),
          inviterId: member.id,
        };

        const invite = await AdminService.createInvite(inviteData);

        const message: EmailVerificationOptions = {
          email: e,
          subject: `Invite from ${organization.name}`,
          message: `Invite to be a part of ${organization.name} as a ${role},
          Click the link http://localhost:1948/api/user/invitee/${organization.id}?role=${role}&student=${confirmStudents}&email=${e} to be a part of them`,
        };
        console.log(message);
        await sendEmailVerification(message);
      })
    );

    res.status(200).json({
      sucess: true,
      message: `The invite has been sent to ${email}`,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteSubject = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const organization = req.organization;
    const { subjectName } = req.body;

    const subjectExists = await AdminService.getOrganizationSubject(
      organization.id,
      subjectName
    );

    if (!subjectExists) {
      return next(new AppError("This Subject does not exist", 400));
    }

    await AdminService.deleteSubject(organization.id, subjectName as string);

    res.status(200).json({
      sucess: true,
      message: `The Subject ${subjectName} has been deleted successfully`,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteClass = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const organization = req.organization;
    const { className } = req.body;

    const classExists = await AdminService.getOrganizationClass(
      organization.id,
      className
    );
    if (!classExists) {
      return next(new AppError("This Class does not exist", 400));
    }

    await AdminService.deleteClass(organization.id, className);

    res.status(200).json({
      sucess: true,
      message: `The Class ${className} has been deleted successfully`,
    });
  } catch (err) {
    next(err);
  }
};

export const updateClass = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const organization = req.organization;
    const { memberId, limit, className } = req.body;

    if (memberId) {
      const memberExists = await MemberService.checkMember(
        memberId,
        organization.id
      );

      if (!memberExists) {
        return next(new AppError("This member does not exist", 400));
      }
    }

    const classData = { memberId, limit };

    const updateClass = await AdminService.updateClass(
      organization.id,
      className,
      classData
    );

    res.status(200).json({ success: true, message: updateClass });
  } catch (err) {
    next(err);
  }
};

export const getAllStudents = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const organization = req.organization;

    const allStudents = await AdminService.getAllStudents(organization.id);

    res.status(200).json({ success: true, message: allStudents });
  } catch (err) {
    next(err);
  }
};
