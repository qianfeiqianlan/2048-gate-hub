import { z } from "zod";

export const loginRequestSchema = z.object({
  username: z
    .string()
    .min(1, "Username cannot be empty")
    .max(512, "Username cannot exceed 512 characters"),
  password: z
    .string()
    .min(1, "Password cannot be empty")
    .max(512, "Password cannot exceed 512 characters"),
});

export const registerRequestSchema = z.object({
  username: z
    .string()
    .min(1, "Username cannot be empty")
    .max(512, "Username cannot exceed 512 characters"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(512, "Password cannot exceed 512 characters"),
});
