import type { NextFunction, Request, Response } from "express";
import type { User } from "@tracker/shared";
import { findUser } from "./users";

// The token is the username. A real system would issue a signed, expiring token;
// the rest of the server only calls currentUser(), so that swap stays in this file.
export function requireUser(req: Request, res: Response, next: NextFunction): void {
  const token = req.header("authorization")?.replace(/^Bearer /, "");
  const user = token ? findUser(token) : undefined;
  if (!user) {
    res.status(401).json({ error: "Not logged in" });
    return;
  }
  res.locals.user = user;
  next();
}

export const currentUser = (res: Response): User => res.locals.user as User;
