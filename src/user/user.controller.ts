import AdminService from "@/admin/admin.service.js";
import { IMember, IParent } from "@/admin/dto/dto.js";
import MemberService from "@/member/member.service.js";
import OrganizationService from "@/organization/organization.service.js";
import { AppError } from "@/utils/appError.js";
import { NextFunction, Request, Response } from "express";

export const inviteeDecision = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;
    const { organizationId } = req.params;
    const { role } = req.query;
    const { student } = req.query;
    const normalizedStudentIds: string[] = Array.isArray(student)
      ? student.map((id) => String(id)) // convert every element
      : student
      ? [String(student)] // wrap single value
      : [];

    //check state of invite to block re entry
    const invite = await AdminService.findInvite(user.email);
    if (invite?.status == "success") {
      return next(new AppError("You can no longer access this endpoint", 401));
    } else if (invite?.status == "failed") {
      return next(new AppError("You can no longer access this endpoint", 401));
    }

    const { decision } = req.body;
    if (decision !== "accept" && decision !== "reject") {
      return next(new AppError("Invalid input", 400));
    }

    const organization = await OrganizationService.getActiveOrganization(
      organizationId
    );

    if (!organization) {
      return next(new AppError("This organization does not exist", 400));
    }
    if (role == "member") {
      if (decision == "accept") {
        const memberData: IMember = {
          organizationId: organizationId,
          userId: user.id,
          role: "member",
          isAssigned: false,
        };
        await MemberService.createMember(memberData);
        await AdminService.updateInvite(user.email, "success");
        return res
          .status(200)
          .json({ success: true, message: `Welcome to ${organization.name}` });
      } else if (decision == "reject")
        return res.status(200).json({
          message: `You have rejected the invite to join ${organization.name}, Thank you for your time`,
        });
    }
    if (role == "parent" && student?.length == 0) {
      if (decision == "accept") {
        const memberData: IParent = {
          organizationId: organizationId,
          userId: user.id,
          studentId: normalizedStudentIds,
          role: "parent",
        };
        await MemberService.createMember(memberData);
        await AdminService.updateInvite(user.email, "success");
        return res
          .status(200)
          .json({ success: true, message: `Welcome to ${organization.name}` });
      } else if (decision == "reject")
        return res.status(200).json({
          message: `You have rejected the invite to join ${organization.name}, Thank you for your time`,
        });
    }
  } catch (err) {
    next(err);
  }
};
