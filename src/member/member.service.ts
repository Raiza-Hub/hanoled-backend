import { db } from "@/db/db.js";
import { member } from "@/db/schema.js";
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
