import { z } from "zod";

export const LoginSchema = z.object({
  email: z.string()
    .min(1, "Email is required")
    .email("Invalid email address"),
  password: z.string()
    .min(6, "Password must be at least 6 characters"),
});

// Create a type from the schema for TypeScript safety
export type LoginFormValues = z.infer<typeof LoginSchema>;

export const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string()
              .min(6, { message: "Password must be at least 6 characters" })
              .max(20, { message: "Password must no more than 20 characters"})
              .refine((value) => /^(?:(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).*)$/.test(value ?? ""), 
                { message: "Password needs at least 1 number, 1 lower case and 1 upper case letter"}
              ),
  confirmPassword: z.string().min(1, { message: "Confirm Password is required"}),
  fullName: z.string().min(1, { message: "Full Name is required"}).max(50, { message: "Full Name must no more than 50 characters"}),
  site: z.string().min(1, { message: "Please select a site" }),
  gender: z.enum(["GUY", "GIRL"], {
    error: "Selection is Required.",
  }),
}).superRefine((value, ctx) => {
    if (value.password !== value.confirmPassword) {
      ctx.addIssue({
        code: "custom",
        path: ["confirmPassword"],
        message: "Password does not match"
      })
    }
});

// Create a type from the schema for TypeScript safety
export type RegisterFormValues = z.infer<typeof RegisterSchema>;