import { IUser } from "@/admin/dto/dto.js";
import { db } from "@/db/db.js";
import { user } from "@/db/schema.js";
import { eq } from "drizzle-orm";

class AuthService {
  static async findUser(email: string) {
    return await db.query.user.findFirst({
      where: eq(user.email, email),
    });
  }
  static async createUser(data: IUser) {
    return await db.insert(user).values(data).returning();
  }
  static async updateUser(email: string, data: boolean) {
    return await db
      .update(user)
      .set({ emailVerified: data })
      .where(eq(user.email, email));
  }
  static async updatePassword(email: string, data: string) {
    return await db
      .update(user)
      .set({ password: data })
      .where(eq(user.email, email));
  }
}

export default AuthService;
