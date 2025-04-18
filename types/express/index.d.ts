import type { User } from "@shared/schema";

declare namespace Express {
  export interface Request {
    user?: Pick<User, "id" | "email" | "username" | "role">;
  }
}
