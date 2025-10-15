import { email, z } from "zod";

export const SignUp = z.object({
  name: z
    .string()
    .min(1, {
      error: "Name is required.",
    })
    .max(50, {
      error: "Name must be at most 50 characters long.",
    }),
  email: z.email({
    error: "Email is required",
  }),
  password: z.string().min(1, {
    error: "Password is required",
  }),
});

export const signIn = z.object({
  email: z.email({
    error: "Email is required",
  }),
  password: z.string().min(1, {
    error: "Password is required",
  }),
});

