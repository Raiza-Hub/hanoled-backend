import type { BetterAuthPlugin } from "better-auth";
import { APIError, createAuthEndpoint, sessionMiddleware } from "better-auth/api";


interface AccountRecord {
  id: string;
  accountId: string;
  providerId: string;
  userId: string;
  password?: string;     
}


export const validate_password = ()=>{
    return {
        id: "validate-password-endpoint",
          endpoints: {
            getHelloWorld: createAuthEndpoint("/my-plugin/validate-current-password", {
                method: "POST",
                use: [sessionMiddleware], 
            }, async(ctx) => {
            const { password } = ctx.body;
            if (!password) {
            throw new APIError("BAD_REQUEST", {
                message: "Password is required",
            });
            }
                
            const session = ctx.context.session;

            if (!session) {
            throw new APIError("UNAUTHORIZED", {
                message: "Not authenticated",
            });
            }
            const userId = session.user.id;

            const account = await ctx.context.adapter.findOne<AccountRecord>({
            model: "account",
            where: [
                { field: "userId", value: userId },
                { field: "providerId", value: "credential" },
            ],
            });

            if (!account) {
            throw new APIError("BAD_REQUEST", {
                message: "No password account found",
            });
            }

            const hash = account.password
            
            if (!hash) {
            throw new APIError("BAD_REQUEST", {
                message: "No password stored",
            });
            }

            const isValid = await ctx.context.password.verify({
            hash,
            password,
            });
                
            if (!isValid) {
            throw new APIError("FORBIDDEN", {
                message: "Incorrect password",
            });
            }

            return ctx.json({ success: true });
            }),   
        }
    } satisfies BetterAuthPlugin
}