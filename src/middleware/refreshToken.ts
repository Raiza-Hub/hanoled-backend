import dotenv from "dotenv";
dotenv.config();
import { verifyRefreshToken, generateJwt } from "@/utils/generateJwt.js";
import { Request, Response, NextFunction } from "express";
import { AppError } from "@/utils/appError.js";

export const refreshAccessToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    //get refresh token
    const token = req.cookies.refreshToken;

    const defaultToken = req.cookies.token;

    //check if token is present
    if (defaultToken) {
      //break
      return next();
    }

    //check if refresh token is present
    if (!token) {
      return next(new AppError("Please Login", 401));
    }

    //decode the refresh token
    const decodedToken = verifyRefreshToken(token);

    if (!decodedToken) {
      return next(new AppError("Problem decoding the token", 409));
    }

    //generate new token
    const newAccessToken = generateJwt(decodedToken.email, decodedToken.id);

    //send new token
    res.cookie("token", newAccessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 15 * 60 * 1000,
    });

    console.log("New Token Generated");
    req.cookies.token = newAccessToken;
    next();
  } catch (err) {
    console.log(err);
    return res.status(400).json({ err: err.message });
  }
};
