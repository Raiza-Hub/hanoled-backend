import AdminService from "@/admin/admin.service.js";
import { AppError } from "./appError.js";
export const getOrgClasandSubId = async (
  organizationId: string,
  subjectName: string,
  className: string
) => {
  const subjectObj = await AdminService.getOrganizationSubject(
    organizationId,
    subjectName as string
  );
  if (!subjectObj) {
    throw new AppError(
      "This subject does not exists in this organization",
      400
    );
  }
  const classObj = await AdminService.getOrganizationClass(
    organizationId,
    className as string
  );
  if (!classObj) {
    throw new AppError("This class does not exists in this organization", 400);
  }

  const classId = classObj.id;
  const subjectId = subjectObj.id;

  return {
    classId,
    subjectId,
  };
};
