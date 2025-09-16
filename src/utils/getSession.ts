import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "../lib/auth";
import { AppError } from "../utils/appError";

export const getUserSession = async () => {
  console.log("getting user session");

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    console.log(new AppError("Please Sign In", 400));
    redirect("/sign-in");
  }

  return session;
};
