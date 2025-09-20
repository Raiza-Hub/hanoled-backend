import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { customSession, openAPI, organization } from "better-auth/plugins";
import { db } from "@/db/db.js";
import { EmailOptions, sendEmail } from "@/utils/mailer.js";
import UserService from "@/user/user.service.js";
import { admin, member, owner, parent } from "./validators/permissions.js";
import { getUserRoles } from "@/utils/getUserRoles.js";
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
  plugins: [
    organization({
      roles: {
        owner,
        admin,
        member,
        parent,
      },
    }),
    customSession(async ({ user, session }) => {
      const role = await getUserRoles(user.id);
      return {
        role,
        user,
        session,
      };
    }),
    openAPI(),
  ],
  // session: {
  //   cookieCache: {
  //     enabled: true,
  //     maxAge: 10 * 60,
  //   },
  // },
});

export type AuthSession = Awaited<ReturnType<typeof auth.api.getSession>>;
