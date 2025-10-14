import dotenv from "dotenv";
import { NextFunction, Request, Response } from "express";
dotenv.config();
import jwt from "jsonwebtoken";
import { AppError } from "@/utils/appError.js";

export const verifyJwt = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeaderPresent = req.cookies.token;
    if (!authHeaderPresent) {
      return next(new AppError("Please Login", 400));
    }
    const decoded = jwt.verify(
      authHeaderPresent,
      process.env.JWT_SECRET as string
    );
    req.user = decoded;
    next();
  } catch (error) {
    return next(error);
  }
};
