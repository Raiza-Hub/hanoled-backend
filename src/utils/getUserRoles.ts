import { eq } from "drizzle-orm";
import { db } from "../db/db";
import { member } from "../db/schema";
import { AppError } from "./appError";

export const getUserRoles = async (userId: string) => {
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
