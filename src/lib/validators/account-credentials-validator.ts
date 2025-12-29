// import { z } from "zod";

// export const SignIn = z.object({
//   email: z.email({
//     error: "Email is required",
//   }),
//   password: z.string().min(1, {
//     error: "Password is required",
//   }),
// });

// export const SignUp = z.object({
//   name: z
//     .string()
//     .min(1, {
//       error: "Name is required.",
//     })
//     .max(50, {
//       error: "Name must be at most 50 characters long.",
//     }),
//   email: z.email({
//     error: "Email is required",
//   }),
//   password: z.string().min(1, {
//     error: "Password is required",
//   }),
// });

// export type TSignIn = z.infer<typeof SignIn>;
// export type TSignUp = z.infer<typeof SignUp>;
