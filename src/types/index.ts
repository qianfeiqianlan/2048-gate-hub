import { D1Database } from "@cloudflare/workers-types";

export * from "./user";
export * from "./score";

export interface Env {
  DB: D1Database;
  JWT_SECRET?: string;
  SALT?: string;
}
export interface RequestContext {
  user?: {
    id: number;
    username: string;
  };
  validatedBody?: any;
  validatedQuery?: any;
}
