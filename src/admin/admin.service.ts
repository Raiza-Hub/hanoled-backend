import { db } from "@/db/db.js";
import { classLevel, subject } from "@/db/schema.js";
import { and, eq } from "drizzle-orm";

class AdminService {
  static async getOrganizationSubjects(organizationId: string) {
    return await db.query.subject.findMany({
      where: eq(subject.organizationId, organizationId),
    });
  }
  static async createSubject(data: any) {
    //any
    return await db.insert(subject).values(data);
  }
  static async getOrganizationSubject(
    organizationId: string,
    subjectName: string,
  ) {
    return await db.query.subject.findFirst({
      where: and(
        eq(subject.organizationId, organizationId),
        eq(subject.subjectName, subjectName),
      ),
    });
  }
  static async getOrganizationClasses(organizationId: string) {
    return await db.query.classLevel.findMany({
      where: eq(classLevel.organizationId, organizationId),
    });
  }
  static async getOrganizationClass(organizationId: string, className: string) {
    return await db.query.classLevel.findFirst({
      where: and(
        eq(classLevel.organizationId, organizationId),
        eq(classLevel.class, className)
      ),
    });
  }
  static async createClass(data: any) {
    return await db.insert(classLevel).values(data);
  }
}

export default AdminService;
