import { Context, Next } from "hono";
import { ZodSchema, ZodError } from "zod";
import { errorResponse } from "../utils/response";

export function validateBody<T>(schema: ZodSchema<T>) {
  return async (c: Context, next: Next) => {
    try {
      const body = await c.req.json();
      const validatedData = schema.parse(body);

      c.set("validatedBody", validatedData);

      await next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessage = (error as any).errors
          .map((err: any) => `${err.path.join(".")}: ${err.message}`)
          .join(", ");
        return errorResponse(c, `Validation failed: ${errorMessage}`, 400);
      }
      return errorResponse(c, "Request body parsing failed", 400);
    }
  };
}

export function validateQuery<T>(schema: ZodSchema<T>) {
  return async (c: Context, next: Next) => {
    try {
      const query = c.req.query();
      const validatedData = schema.parse(query);

      c.set("validatedQuery", validatedData);

      await next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessage = (error as any).errors
          .map((err: any) => `${err.path.join(".")}: ${err.message}`)
          .join(", ");
        return errorResponse(
          c,
          `Query parameter validation failed: ${errorMessage}`,
          400
        );
      }
      return errorResponse(c, "Query parameter parsing failed", 400);
    }
  };
}
