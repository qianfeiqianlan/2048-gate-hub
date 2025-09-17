import { z } from "zod";

export const uploadScoreRequestSchema = z.object({
  gameId: z
    .string()
    .min(1, "Game ID cannot be empty")
    .max(512, "Game ID cannot exceed 512 characters"),
  score: z.number().positive("Score must be a positive number"),
  timestamp: z.number().positive("Timestamp must be a positive number"),
  date: z
    .string()
    .min(1, "Date cannot be empty")
    .max(50, "Date cannot exceed 50 characters"),
});

export const uploadMultipleScoresRequestSchema = z.object({
  scores: z.array(uploadScoreRequestSchema),
});
