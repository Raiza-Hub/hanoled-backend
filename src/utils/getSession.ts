
import { AppError } from "./appError.js";
import { redirect } from "next/navigation.js";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "@/lib/auth.js";
import { Request } from "express";


export const getUserSession = async (req: Request) => {
  console.log("getting user session");

  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });

  
  if (!session) {
    console.log(new AppError("Please Sign In", 400));
    redirect("/sign-in");
  }

  return session;
};
