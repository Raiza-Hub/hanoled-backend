import dotenv from "dotenv";
dotenv.config();
import jwt from "jsonwebtoken";
import { AppError } from "./appError.js";

export const generateJwt = (email: string, id: string) => {
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret)
      return new AppError("JWT_SECRET is not defined in your .env file", 400);

    const payload = { email, id };
    return jwt.sign(payload, secret, {
      expiresIn: "20m",
    });
  } catch (err) {
    console.log(err);
  }
};

export const generateRefeshToken = (email: string, id: string) => {
  try {
    const refresh_secret = process.env.REFRESH_SECRET;
    if (!refresh_secret) {
      return new AppError("REFRESH_SECRET IS NOT BEING PASSED", 400);
    }
    const payload = { email, id };
    return jwt.sign(payload, refresh_secret, {
      expiresIn: "7d",
    });
  } catch (err) {
    console.log(err);
  }
};

export const verifyRefreshToken = (token: string) => {
  try {
    const refresh_secret = process.env.REFRESH_SECRET;
    const decoded = jwt.verify(token, refresh_secret as string);
    return decoded as jwt.JwtPayload;
  } catch (err) {
    console.log(err);
  }
};
