import { APIError, betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { createAuthEndpoint, openAPI, organization } from "better-auth/plugins";
import { db } from "@/db/db.js";
import { EmailOptions, sendEmail } from "@/utils/mailer.js";
import UserService from "@/user/user.service.js";
import { admin, member, owner, parent } from "./validators/permissions.js";
import { validate_password } from "./plugins/validate-password/index.js";
// import { getUserRoles } from "@/utils/getUserRoles.js";
// import { getUserSchoolRoles } from "@/organization/organization.controller.js";
// import { admin, member, owner, parent } from "";
// import { getUserRoles } from "../utils/getUserRoles";
// import { EmailOptions, sendEmail } from "../utils/mailer";
// import UserService from "../user/user.service";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    },
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url, token }, request) => {
      const data: EmailOptions = {
        email: user.email,
        subject: "Verify your email address",
        message: `Click the link to verify your email address: ${url}`,
      };
      await sendEmail(data);
    },
    sendOnSignUp: true,
    async afterEmailVerification(user, request) {
      await UserService.updateUser(user.id, {
        emailVerified: true,
      });
      console.log(`${user.email} has been sucessfully verified!`);
    },
    autoSignInAfterVerification: true,
  },
    trustedOrigins: [
    "http://localhost:3000", // ✅ your Next.js frontend
    "http://localhost:8000", // ✅ your backend (keep this too)
  ],
  plugins: [
    organization({
      roles: {
        owner,
        admin,
        member,
        parent,
      },
    }),
    // customSession(async ({ user, session }) => {
    //   const role = await getUserSchoolRoles(user.id);
    //   return {
    //     role,
    //     user,
    //     session,
    //   };
    // }),
    openAPI(),
    validate_password()

  ],
  // session: {
  //   cookieCache: {
  //     enabled: true,
  //     maxAge: 10 * 60,
  //   },
  // },
});

export type AuthSession = Awaited<ReturnType<typeof auth.api.getSession>>;
