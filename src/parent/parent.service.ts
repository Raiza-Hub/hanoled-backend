import { and, eq } from "drizzle-orm";
import { db } from "../db/db";
import { parent } from "../db/schema";

class ParentService {
  static async getParentRecord(userId: string, organizationId: string) {
    return await db.query.parent.findFirst({
      where: and(
        eq(parent.userId, userId),
        eq(parent.organizationId, organizationId)
      ),
    });
  }
}

export default ParentService;
