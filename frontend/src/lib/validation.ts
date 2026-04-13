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