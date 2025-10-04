import { db } from "@/db/db.js";
import { classLevel, member, parent, student, subject } from "@/db/schema.js";
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
    subjectName: string
  ) {
    return await db.query.subject.findFirst({
      where: and(
        eq(subject.organizationId, organizationId),
        eq(subject.subjectName, subjectName)
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
  static async updateMember(memberId: string, data: boolean) {
    return await db
      .update(member)
      .set({ isAssigned: data })
      .where(eq(member.id, memberId))
      .returning();
  }
  static async getStudent(
    firstName: string,
    lastName: string,
    middleName: string
  ) {
    return await db.query.student.findFirst({
      where: and(
        eq(student.firstName, firstName),
        eq(student.lastName, lastName),
        eq(student.middleName, middleName)
      ),
    });
  }
  static async createStudent(data: any) {
    return await db.insert(student).values(data);
  }

  static async getOrganizationMembers(organizationId: string) {
    return await db.query.member.findMany({
      where: eq(member.organizationId, organizationId),
    });
  }
  static async getOrganizationParents(organizationId: string) {
    return await db.query.parent.findMany({
      where: eq(parent.organizationId, organizationId),
    });
  }
}

export default AdminService;
