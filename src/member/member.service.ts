import { IMember, IParent } from "@/admin/dto/dto.js";
import { db } from "@/db/db.js";
import { classLevel, member, parent, student } from "@/db/schema.js";
import { and, eq } from "drizzle-orm";

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
    } else if ("studentId" in data) {
      return await db.insert(parent).values(data).returning();
    }
  }
  static async getAssignedClass(memberId: string) {
    return await db.query.classLevel.findMany({
      where: eq(classLevel.memberId, memberId),
      // with: {
      //   student: true,
      // },
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
}

export default MemberService;
