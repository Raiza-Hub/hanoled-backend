import { and, eq } from "drizzle-orm";
import { db } from "../db/db";
import { member } from "../db/schema";

class MemberService {
  static async getAllMembers(userId: string) {
    return await db.query.member.findMany({
      where: eq(member.userId, userId),
      with: {
        user: true,
      },
    });
  }
  static async getMember(userId: string) {
    return await db.query.member.findFirst({
      where: eq(member.userId, userId),
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
}

export default MemberService;
