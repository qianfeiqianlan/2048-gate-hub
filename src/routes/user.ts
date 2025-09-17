import { Hono } from "hono";
import { UserService } from "../services";
import { generateToken } from "../utils";
import { successResponse, errorResponse } from "../utils/response";
import { validateBody } from "../middleware";
import { loginRequestSchema } from "../schemas";
import type { Env, RequestContext } from "../types";

const userRouter = new Hono<{ Bindings: Env; Variables: RequestContext }>();

userRouter.post("/login", validateBody(loginRequestSchema), async (c) => {
  try {
    const loginData = c.get("validatedBody");
    const userService = new UserService(c.env.DB);
    const salt = c.env.SALT || "tinca-salt";
    const jwtSecret = c.env.JWT_SECRET || "tinca-salt";

    const userInfo = await userService.login(loginData, salt);
    const token = generateToken(
      { id: userInfo.id, username: userInfo.username },
      jwtSecret
    );

    return successResponse(
      c,
      {
        userInfo,
        token,
      },
      "Login successful"
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Login failed";
    return errorResponse(c, message, 401);
  }
});

export default userRouter;
