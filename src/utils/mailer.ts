import dotenv from "dotenv";
dotenv.config();
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY as string);

export interface EmailOptions {
  email: string;
  subject: string;
  message: string;
}

console.log(process.env.USER_NAME, process.env.USER_MAIL);

export const sendEmail = async (options: EmailOptions) => {
  const { data, error } = await resend.emails.send({
    from: "Acme <onboarding@resend.dev>",
    to: options.email,
    subject: options.subject,
    html: options.message,
  });

  if (error) {
    console.log(error);
  }

  console.log("Email has been sent", data);
};
