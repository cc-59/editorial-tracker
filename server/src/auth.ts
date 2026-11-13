import type { NextFunction, Request, Response } from "express";
import type { User } from "@tracker/shared";
import { findUser } from "./users";

// The token is the username because the case allows mock authentication.
// Real tokens would change only this file because the routes call currentUser().
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
