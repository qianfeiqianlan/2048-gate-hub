import { Hono } from "hono";
import { ScoreService } from "../services";
import {
  successResponse,
  errorResponse,
  conflictResponse,
} from "../utils/response";
import { validateBody } from "../middleware";
import {
  uploadScoreRequestSchema,
  uploadMultipleScoresRequestSchema,
} from "../schemas";
import type { Env, RequestContext } from "../types";

const scoreRouter = new Hono<{ Bindings: Env; Variables: RequestContext }>();

scoreRouter.get("/", async (c) => {
  try {
    const user = c.get("user");
    if (!user) {
      return errorResponse(c, "User not authenticated", 401);
    }

    const scoreService = new ScoreService(c.env.DB, c.env.KV);
    const result = await scoreService.getUserScores(user.id);

    return successResponse(c, result, "User scores retrieved successfully");
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to retrieve user scores";
    return errorResponse(c, message, 500);
  }
});

scoreRouter.post("/", validateBody(uploadScoreRequestSchema), async (c) => {
  try {
    const user = c.get("user");
    if (!user) {
      return errorResponse(c, "User not authenticated", 401);
    }

    const scoreData = c.get("validatedBody");
    const country = c.req.header("CF-IPCountry");
    const scoreService = new ScoreService(c.env.DB, c.env.KV);
    const result = await scoreService.uploadScore(user.id, scoreData, country);

    return successResponse(c, result, "Score uploaded successfully", 201);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to upload score";
    if (message.includes("already exists")) {
      return conflictResponse(c, message);
    }
    return errorResponse(c, message, 500);
  }
});

scoreRouter.post(
  "/multiple",
  validateBody(uploadMultipleScoresRequestSchema),
  async (c) => {
    try {
      const user = c.get("user");
      if (!user) {
        return errorResponse(c, "User not authenticated", 401);
      }

      const { scores } = c.get("validatedBody");
      const country = c.req.header("CF-IPCountry");
      const scoreService = new ScoreService(c.env.DB, c.env.KV);
      const result = await scoreService.uploadMultipleScores(
        user.id,
        scores,
        country
      );

      return successResponse(
        c,
        result,
        "Batch scores uploaded successfully",
        201
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to upload batch scores";
      if (message.includes("already exists")) {
        return conflictResponse(c, message);
      }
      return errorResponse(c, message, 500);
    }
  }
);

scoreRouter.get("/leaderboard", async (c) => {
  try {
    const scoreService = new ScoreService(c.env.DB, c.env.KV);
    const result = await scoreService.getTopScores();

    return successResponse(c, result, "Leaderboard retrieved successfully");
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to retrieve leaderboard";
    return errorResponse(c, message, 500);
  }
});

export default scoreRouter;
