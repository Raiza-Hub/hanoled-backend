import { auth } from "@/lib/auth.js";
import { AppError } from "@/utils/appError.js";
import { fromNodeHeaders } from "better-auth/node";
import { NextFunction, Request, Response } from "express";

export const getSession = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log("Received cookies:", req.headers.cookie);

    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers), // convert Express headers
    });

    if (!session) {
      return next(new AppError("Please sign In", 401));
    }

    // session.user contains user details from Better Auth
    req.user = session.user;

    next();
  } catch (err) {
    console.error("Session error:", err);
    return next(err);
  }
};
