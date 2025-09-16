import { APIError } from "better-auth";
import { NextFunction, Request, Response } from "express";
import { auth } from "../lib/auth";
// import { getUserSession } from "../utils/getSession";
// import { AppError } from "../utils/appError";
// import UserService from "../user/user.service";

export const signUp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, email, password } = req.body;

    await auth.api.signUpEmail({
      body: {
        name,
        email,
        password,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Signed Up SucessFully",
    });
  } catch (err) {
    if (err instanceof APIError) {
      console.log(err.message, err.status);
    }
    next(err);
  }
};

export const signIn = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;
    await auth.api.signInEmail({
      body: {
        email,
        password,
      },
    });

    return res
      .status(200)
      .json({ sucess: true, message: "Signed In Successfully" });
  } catch (err) {
    if (err instanceof APIError) {
      console.log(err.message, err.status);
    }
    next(err);
  }
};

// export const verifyEmail = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const { user } = await getUserSession();
//     const { token } = req.query;

//     if (!token) {
//       return next(new AppError("Please verify your account", 400));
//     }

//     await UserService.updateUser(user.id, {
//       emailVerified: true,
//     });
//     console.log(`${user.email} has been sucessfully verified!`);
//   } catch (err) {
//     if (err instanceof APIError) {
//       console.log(err.message, err.status);
//     }
//     next(err);
//   }
// };
