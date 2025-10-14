// // import { auth } from "@/lib/auth.js";
// import MemberService from "@/member/member.service.js";
// import { AppError } from "@/utils/appError.js";
// import { fromNodeHeaders } from "better-auth/node";
// import { NextFunction, Request, Response } from "express";

// export const getSession = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     console.log("Received cookies:", req.headers.cookie);

//     const session = await auth.api.getSession({
//       headers: fromNodeHeaders(req.headers), // convert Express headers
//     });

//     if (!session) {
//       return next(new AppError("Please sign In", 401));
//     }
//     const memberUser = await MemberService.getMember(session.user.id);

//     if (!memberUser) {
//       return next(new AppError("There was an issue getting the member", 500));
//     }

//     // session.user contains user details from Better Auth
//     req.user = memberUser;

//     next();
//   } catch (err) {
//     console.error("Session error:", err);
//     return next(err);
//   }
// };
