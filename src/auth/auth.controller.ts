import { NextFunction, Request, Response } from "express";
import AuthService from "./auth.service.js";
import { AppError } from "@/utils/appError.js";
import { SignUp } from "@/lib/validators/validateSchema.js";
import OtpService from "./otp/otp.service.js";
import { generateOtp } from "@/utils/generateOtp.js";
import bcrypt from "bcrypt";
import {
  EmailVerificationOptions,
  sendEmailVerification,
} from "@/utils/mailer.js";
import { generateJwt, generateRefeshToken } from "@/utils/generateJwt.js";
import { IOtp } from "@/admin/dto/dto.js";

export const userSignUp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, email, password } = req.body;

    //check if user exists
    const userExists = await AuthService.findUser(email);

    if (userExists) {
      return next(new AppError("This user already exixts", 400));
    }

    //validate schema
    const result = SignUp.safeParse(req.body);
    if (!result.success) {
      return next(new AppError(`${result.error.format}`, 400));
    }

    //check otp and delete old user otp
    const checkOtp = await OtpService.findOtp(email);
    if (checkOtp) {
      await OtpService.deleteOtp(email);
    }

    //generate Otp
    const otp: string = generateOtp();
    const otpExpiry: Date = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    await OtpService.createOtp({
      otp: await bcrypt.hash(otp, 10),
      email,
      expiresAt: otpExpiry.toISOString(),
    });

    //create User
    const data = {
      name,
      email,
      password: await bcrypt.hash(password, 10),
    };

    const [newUser] = await AuthService.createUser(data);

    //send mail
    const options: EmailVerificationOptions = {
      email: email,
      subject: "Please Input Otp to complete signup process",
      message: `Your Otp is ${otp}`,
    };
    await sendEmailVerification(options);

    //generate token
    const token = generateJwt(email, newUser.id);
    console.log(token);

    //generteRefresh Token
    const refreshToken = generateRefeshToken(email, newUser.id);

    //send cookies
    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 20 * 60 * 1000, //15 minutess
    });

    //send refresh cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      // path: "/api/v1/auth/refresh-token", // come back and work on refresh token later
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, //7 days
    });

    //response
    res.status(201).json({ success: true, result: newUser });
  } catch (err) {
    console.log(err);
    next(err);
  }
};

export const userLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    //check if user exists
    const userExists = await AuthService.findUser(email);
    if (!userExists) {
      return next(new AppError("This user does not exsist", 401));
    }

    //check if password is valid
    const validPassword = await bcrypt.compare(password, userExists.password);
    if (!validPassword) {
      return next(new AppError("Invalid Email or Password", 401));
    }

    //generate token
    const token = generateJwt(email, userExists.id.toString());
    console.log(token);

    //generteRefresh Token
    const refreshToken = generateRefeshToken(email, userExists.id.toString());

    //send cookies
    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 20 * 60 * 1000, //15 minutess
    });

    //send refresh cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      // path: "/api/v1/auth/refresh-token", // come back and work on refresh token later
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, //7 days
    });

    res.status(200).json({ sucess: true, message: "Logged in successfully" });
  } catch (err) {
    console.log(err);
    next(err);
  }
};

export const verifyUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.body.otp;
    const { email } = req.user; //find user
    const user = await AuthService.findUser(email);
    if (!user) {
      return next(new AppError("Please Sign In", 401));
    }

    if (user.emailVerified === true) {
      return next(new AppError("User Already Verified", 400));
    }
    //find  otp
    const otp = await OtpService.findOtp(email);
    if (!otp) {
      return next(new AppError("Please request for another Otp", 500));
    }

    const rawOtp = otp.otp;

    //check if otp is valid
    const isValid = await bcrypt.compare(token, rawOtp);
    if (!isValid) {
      return next(new AppError("Invalid Otp", 401));
    }

    //change is verified to true
    const userData = true;

    await AuthService.updateUser(email, userData);

    await OtpService.deleteOtp(email);

    res.status(200).json({ message: "User Verified" });
  } catch (err) {
    console.log(err);
    next(err);
  }
};

export const getNewOtp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email } = req.user;

    //find user
    const user = await AuthService.findUser(email);
    if (!user) {
      return next(new AppError("Please Sign In", 401));
    }

    const isVerified = user.emailVerified;

    if (isVerified) {
      return next(
        new AppError(
          "You cannot request for a new Otp as you have already completed your signup process",
          400
        )
      );
    }

    //generate otp
    const otp: string = generateOtp();
    const otpExpiry: Date = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    //check otp and delete old user otp
    const checkOtp = await OtpService.findOtp(email);

    if (checkOtp) {
      await OtpService.deleteOtp(email);
    }

    const options: EmailVerificationOptions = {
      email: email,
      subject: "This is your new Otp",
      message: `This is your new Otp ${otp}, proceed to the verify page to complete account setup`,
    };

    //create new otp in database
    await OtpService.createOtp({
      email,
      otp: await bcrypt.hash(otp, 10),
      expiresAt: otpExpiry.toISOString(),
    });

    await sendEmailVerification(options);

    res
      .status(200)
      .json({ message: "Your new Otp has been sent to your mail" });
  } catch (err) {
    console.log(err);
    next(err);
  }
};

export const userProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    //get user email from the cookie
    const userEmail = req.user.email;

    //find user
    const user = await AuthService.findUser(userEmail);
    if (!user) {
      return next(
        new AppError("There was a problem in getting the users details", 500)
      );
    }

    return res.status(200).json({ message: `Welcome ${user?.name}`, user });
  } catch (err) {
    next(err);
  }
};

export const deleteProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    //get user email from token
    const userEmail = req.user.email;

    //perform soft delete by converting isVerified to false
    const data = false;

    await AuthService.updateUser(userEmail, data);

    res.clearCookie("token");

    return res.status(200).json({ message: "The user has been deleted" });
  } catch (err) {
    next(err);
  }
};

export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    //state all the necessary details to be inputted
    const email = req.body.email;

    //find if the userExists
    const userExists = await AuthService.findUser(email);

    if (!userExists) {
      return res.status(401).json({ message: "This user does not exist" });
    }

    const otp = generateOtp();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    const otpData: IOtp = {
      email,
      otp: await bcrypt.hash(otp, 10),
      expiresAt: otpExpiry.toISOString(),
    };

    const newOtp = await OtpService.createOtp(otpData);

    //send otp to the user
    const message: EmailVerificationOptions = {
      email: req.body.email,
      subject: "Please input Otp to proceed to reset your password",
      message: `This is your reset otp ${otp}`,
    };

    await sendEmailVerification(message);

    res.status(200).json({
      message:
        "An otp has been sent to your mail please input to proceed to the reset password page to input your password",
    });
  } catch (err) {
    next(err);
  }
};

export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    //state all important details to be inputted
    const { email, newPassword, confirmPassword } = req.body;
    const inputOtp = req.body.otp;

    const tokenEmail = req.user.email;

    if (newPassword !== confirmPassword) {
      return next(new AppError("Your passwords dont match", 400));
    }

    //find user
    const userExists = await AuthService.findUser(email);

    //find if user exists
    if (!userExists) {
      return res.status(401).json({ message: "This user does not exist" });
    }

    //confirm the email
    if (email != tokenEmail) {
      return res
        .status(400)
        .json({ message: "Please enter the correct email " });
    }

    //get otp from model
    const otpReset = await OtpService.findOtp(email);

    if (!otpReset) {
      return res.status(401).json({ message: "otp expired" });
    }

    const realOtp = otpReset.otp;

    const isValid = await bcrypt.compare(inputOtp, realOtp);
    console.log(isValid);
    if (!isValid) {
      return res.status(400).json({ message: "Invalid or Expired Otp" });
    }

    //update the password of the user with his input
    const data = await bcrypt.hash(newPassword, 10);

    await AuthService.updatePassword(email, data);

    //delete Used Otp
    await OtpService.deleteOtp(tokenEmail);

    return res
      .status(200)
      .json({ message: "Password changed successfully", userExists });
  } catch (err) {
    next(err);
  }
};

export const logout = (req: Request, res: Response, next: NextFunction) => {
  try {
    res
      .clearCookie("token")
      .clearCookie("refreshToken")
      .status(200)
      .json({ message: "Logged out successfully" });
  } catch (err) {
    console.log(err);
    next(err);
  }
};
