import { db } from "@/db/db.js";
import { member } from "@/db/schema.js";
import { eq } from "drizzle-orm";
import { AppError } from "./appError.js";

export const getUserRoles = async (userId: string) => {
  console.log(userId);
  const memberUser = await db.query.member.findFirst({
    where: eq(member.userId, userId),
    columns: { role: true },
  });

  if (!memberUser) {
    console.log(new AppError("This member does not exist", 401));
    return null;
  }
  return memberUser?.role || null;
};
