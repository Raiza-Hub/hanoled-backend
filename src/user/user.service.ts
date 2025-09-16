import { eq } from "drizzle-orm";
import { db } from "../db/db";
import { User, user } from "../db/schema";

class UserService {
  static async updateUser(id: string, data: Partial<User>) {
    return await db.update(user).set(data).where(eq(user.id, id));
  }
}

export default UserService;
