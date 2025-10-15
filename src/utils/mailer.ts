import dotenv from "dotenv";
dotenv.config();
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY as string);

export interface EmailOptions {
  email: string;
  invitedByUsername: string;
  invitedByEmail: string;
  teamName: string;
  inviteLink: string;
}
export interface EmailVerificationOptions {
  email: string;
  subject: string;
  message: string;
}

// console.log(process.env.USER_NAME, process.env.USER_MAIL);

export const sendEmail = async (options: EmailOptions) => {
  const subject = `Invitation to join ${options.teamName};`;
  const text = `Hello,
  
  You have been invited by ${options.invitedByUsername} (${options.invitedByEmail}) to join the organization ${options.teamName}.
  
  To accept the invitation, please click the following link: ${options.inviteLink}
  
  If you have any questions, feel free to reach out.
  
  Best regards,
  The Team`;
  const { data, error } = await resend.emails.send({
    from: `${process.env.USER_MAIL}`,
    to: options.email,
    subject: subject.trim(),
    text: text.trim(),
  });

  if (error) {
    console.log(error);
  }

  console.log("Email has been sent", data);
};

export const sendEmailVerification = async (
  options: EmailVerificationOptions
) => {
  const { data, error } = await resend.emails.send({
    from: `${process.env.USER_MAIL}`,
    to: options.email,
    subject: options.subject.trim(),
    text: options.message.trim(),
  });

  if (error) {
    console.log(error);
  }

  console.log("Email has been sent", data);
};
