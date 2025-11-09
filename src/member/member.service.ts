import { IMember, IParent, IParentToStudent, ISubjectSpreadsheet } from "@/admin/dto/dto.js";
import { db } from "@/db/db.js";
import {
  classLevel,
  subjectSpreadsheet,
  member,
  parent,
  parentToStudents,
  results,
  student,
  SubjectSpreadsheet,
} from "@/db/schema.js";
import { and, eq, inArray, sql, SQL } from "drizzle-orm";

class MemberService {
  static async getAllMembers(userId: string) {
    return await db.query.member.findMany({
      where: eq(member.userId, userId),
      with: {
        user: true,
      },
    });
  }

  static async getSpecificMember(userId: string, organizationId: string) {
    return await db.query.member.findFirst({
      where: and(
        eq(member.userId, userId),
        eq(member.organizationId, organizationId)
      ),
    });
  }

  static async getMemberRecord(userId: string, organizationId: string) {
    return await db.query.member.findFirst({
      where: and(
        eq(member.userId, userId),
        eq(member.organizationId, organizationId)
      ),
      columns: { role: true },
    });
  }

  static async createMember(data: IMember | IParent) {
    if ("isAssigned" in data) {
      return await db.insert(member).values(data).returning();
    } else {
      return await db.insert(parent).values(data).returning();
    }
  }

  static async createParentToStudent(data: IParentToStudent) {
    return await db.insert(parentToStudents).values(data);
  }
  static async getAssignedClass(memberId: string) {
    return await db.query.classLevel.findMany({
      where: eq(classLevel.memberId, memberId),
      with: {
        students: {
          columns: {
            firstName: true,
            middleName: true,
            lastName: true,
            admissionDate: true,
          },
        },
      },
    });
  }
  static async checkMember(memberId: string, organizationId: string) {
    return await db.query.member.findFirst({
      where: and(
        eq(member.id, memberId),
        eq(member.organizationId, organizationId)
      ),
    });
  }
  static async subjectSpreadsheetExists(
    organizationId: string,
    subjectId: string,
    classId: string
  ) {
    return await db.query.subjectSpreadsheet.findFirst({
      where: and(
        eq(subjectSpreadsheet.organizationId, organizationId),
        eq(subjectSpreadsheet.subjectId, subjectId),
        eq(subjectSpreadsheet.classId, classId)
      ),
    });
  }
  static async createSubjectSpreadsheet(data: ISubjectSpreadsheet) {
    return await db.insert(subjectSpreadsheet).values(data).returning();
  }
  static async mergeSubjects(query: SQL<unknown>) {
    return await db.execute(query);
  }
  static async selectedSubjectResults(
    selectedColumn: any,
    selectedSubjects: any
  ) {
    return await db
      .select({
        studentId: results.studentId,
        studentName: student.lastName,
        subjectName: results.subjectName,
        value: sql<number>`(data ->> ${selectedColumn})::int`,
      })
      .from(results)
      .where(inArray(results.subjectName, selectedSubjects));
  }
}

export default MemberService;
