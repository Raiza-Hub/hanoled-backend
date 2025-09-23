import { db } from "@/db/db.js";
import { user, type User,  } from "@/db/schema.js";
import { eq } from "drizzle-orm";


class UserService {
  static async updateUser(id: string, data: Partial<User>) {
    return await db.update(user).set(data).where(eq(user.id, id));
  }
}

export default UserService;
