import { db } from "@/db/db.js";
import {
  ClassLevel,
  classLevel,
  invitation,
  member,
  organization,
  parent,
  spreadsheetDetails,
  Student,
  student,
  subject,
} from "@/db/schema.js";
import { and, eq } from "drizzle-orm";
import { IClass, IInvite, IStudent, ISubject, status } from "./dto/dto.js";

class AdminService {
  static async getOrganizationSubjects(organizationId: string) {
    return await db.query.subject.findMany({
      where: eq(subject.organizationId, organizationId),
    });
  }
  static async createSubject(data: ISubject) {
    //any
    return await db.insert(subject).values(data).returning();
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
      with: {
        member: {
          with: {
            user: true,
          },
        },
      },
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
  static async createClass(data: IClass) {
    return await db.insert(classLevel).values(data).returning();
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
  static async createStudent(data: IStudent) {
    return await db.insert(student).values(data).returning();
  }
  static async updateStudent(studentId: string, data: Partial<Student>) {
    return await db
      .update(student)
      .set(data)
      .where(eq(student.id, studentId))
      .returning();
  }

  static async getOrganizationMembers(organizationId: string) {
    return await db.query.member.findMany({
      where: eq(member.organizationId, organizationId),
      with: {
        user: true,
      },
    });
  }
  static async getOrganizationParents(organizationId: string) {
    return await db.query.parent.findMany({
      where: eq(parent.organizationId, organizationId),
      with: {
        user: {
          columns: {
            name: true,
            email: true,
            image: true,
          },
        },
        students: {
          with: {
            student: true,
          },
        },
      },
    });
  }
  static async createInvite(data: IInvite) {
    return await db.insert(invitation).values(data).returning();
  }
  static async updateInvite(
    email: string,
    role: "member" | "parent" | "admin",
    data: status
  ) {
    return await db
      .update(invitation)
      .set({ status: data })
      .where(and(eq(invitation.email, email), eq(invitation.role, role)));
  }
  static async findInvite(email: string, role: "member" | "parent" | "admin") {
    return await db.query.invitation.findFirst({
      where: and(eq(invitation.email, email), eq(invitation.role, role)),
    });
  }
  static async findInviteByEmail(email: string) {
    return await db.query.invitation.findFirst({
      where: eq(invitation.email, email),
    });
  }
  static async updateOrganizationMember(slug: string, data: number) {
    return await db
      .update(organization)
      .set({ teacherNo: data })
      .where(eq(organization.slug, slug));
  }
  static async updateOrganizationParent(slug: string, data: number) {
    return await db
      .update(organization)
      .set({ parentNo: data })
      .where(eq(organization.slug, slug));
  }
  static async updateOrganizationStudent(slug: string, data: number) {
    return await db
      .update(organization)
      .set({ studentNo: data })
      .where(eq(organization.slug, slug));
  }
  static async deleteInvite(
    email: string,
    organizationId: string,
    role: "member" | "admin" | "parent"
  ) {
    return await db
      .delete(invitation)
      .where(
        and(
          eq(invitation.email, email),
          eq(invitation.organizationId, organizationId),
          eq(invitation.role, role)
        )
      );
  }
  static async deleteSubject(id: string, subjectName: string) {
    return await db
      .delete(subject)
      .where(
        and(
          eq(subject.organizationId, id),
          eq(subject.subjectName, subjectName)
        )
      );
  }
  static async deleteClass(id: string, className: string) {
    return await db
      .delete(classLevel)
      .where(
        and(eq(classLevel.organizationId, id), eq(classLevel.class, className))
      );
  }
  static async updateClass(
    organizationId: string,
    className: string,
    data: Partial<ClassLevel>
  ) {
    return await db
      .update(classLevel)
      .set(data)
      .where(
        and(
          eq(classLevel.organizationId, organizationId),
          eq(classLevel.class, className)
        )
      )
      .returning();
  }
  static async getAllStudents(organizationId: string) {
    return await db.query.student.findMany({
      where: eq(student.organizationId, organizationId),
      with: {
        parent: {
          with: {
            parent: {
              with: {
                user: {
                  columns: {
                    name: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }
  static async getSpecificStudent(organizationId: string, studentId: string) {
    return await db.query.student.findFirst({
      where: and(
        eq(student.organizationId, organizationId),
        eq(student.id, studentId)
      ),
    });
  }
  static async removeMember(memberId: string) {
    return await db.delete(member).where(eq(member.id, memberId));
  }
  static async removeParent(parentId: string) {
    return await db.delete(parent).where(eq(parent.id, parentId));
  }
  static async getOrganizationInvites(organizationId: string) {
    return await db.query.invitation.findMany({
      where: eq(invitation.organizationId, organizationId),
    });
  }
  static async getOrganizationMember(organizationId: string, memberId: string) {
    return await db.query.member.findFirst({
      where: and(
        eq(member.organizationId, organizationId),
        eq(member.id, memberId)
      ),
    });
  }
  static async getOrganizationParent(organizationId: string, parentId: string) {
    return await db.query.parent.findFirst({
      where: and(
        eq(parent.organizationId, organizationId),
        eq(parent.id, parentId)
      ),
    });
  }
  static async getAllOragnizationSpreadSheet(
    organizationId: string,
    status: "active" | "pending" | "inactive"
  ) {
    return await db.query.spreadsheetDetails.findMany({
      where: and(
        eq(spreadsheetDetails.organizationId, organizationId),
        eq(spreadsheetDetails.status, status)
      ),
    });
  }
  static async getSpreadsheetDetails(
    memberId: string,
    subjectId: string,
    classId: string,
    status: "active" | "pending" | "inactive"
  ) {
    return await db.query.spreadsheetDetails.findFirst({
      where: and(
        eq(spreadsheetDetails.memberId, memberId),
        eq(spreadsheetDetails.subjectId, subjectId),
        eq(spreadsheetDetails.classId, classId),
        eq(spreadsheetDetails.status, status)
      ),
    });
  }
}
export default AdminService;
