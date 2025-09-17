import { Context } from "hono";

export function successResponse<T>(
  c: Context,
  data: T,
  message: string = "Success",
  status: number = 200
) {
  return c.json(
    {
      success: true,
      message,
      data,
    },
    status as any
  );
}

export function errorResponse(
  c: Context,
  message: string,
  status: number = 400
) {
  return c.json(
    {
      success: false,
      message,
      data: null,
    },
    status as any
  );
}

export function unauthorizedResponse(
  c: Context,
  message: string = "Unauthorized"
) {
  return errorResponse(c, message, 401);
}

export function conflictResponse(c: Context, message: string = "Conflict") {
  return errorResponse(c, message, 409);
}

export function internalErrorResponse(
  c: Context,
  message: string = "Internal Server Error"
) {
  return errorResponse(c, message, 500);
}
