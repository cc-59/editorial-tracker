import * as z from "zod";

export const UserRole = z.enum(["contributor", "editor"]);

export const User = z.object({
  userName: z.string(),
  displayName: z.string(),
  role: UserRole,
});

export type User = z.infer<typeof User>;
