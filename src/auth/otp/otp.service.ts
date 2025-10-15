import { IOtp } from "@/admin/dto/dto.js";
import { db } from "@/db/db.js";
import { otp } from "@/db/schema.js";
import { eq } from "drizzle-orm";

class OtpService {
  static async findOtp(email: string) {
    return await db.query.otp.findFirst({
      where: eq(otp.email, email),
    });
  }
  static async deleteOtp(email: string) {
    return await db.delete(otp).where(eq(otp.email, email));
  }
  static async createOtp(data: IOtp) {
    return await db.insert(otp).values(data);
  }
}

export default OtpService;
